import { Chart as Chartjs } from 'chart.js';
import { getjQuery } from '../mdb/util/index';
import Data from '../mdb/dom/data';
import Manipulator from '../mdb/dom/manipulator';
import SelectorEngine from '../mdb/dom/selector-engine';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const merge = require('deepmerge');

const NAME = 'chart';
const DATA_KEY = 'mdb.chart';
const CLASSNAME_CHARTS = 'chart';

//  Default data
const DEFAULT_DATA = {
  line: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgba(66, 133, 244, 0.0)',
          borderColor: 'rgb(66, 133, 244)',
          borderWidth: 2,
          pointBorderColor: 'rgb(66, 133, 244)',
          pointBackgroundColor: 'rgb(66, 133, 244)',
          lineTension: 0.0,
        },
      ],
    },
  },
  bar: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgb(66, 133, 244)',
          borderWidth: 0,
        },
      ],
    },
  },
  horizontalBar: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgb(66, 133, 244)',
          borderWidth: 0,
        },
      ],
    },
  },
  pie: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgb(66, 133, 244)',
        },
      ],
    },
  },
  doughnut: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgb(66, 133, 244)',
        },
      ],
    },
  },
  polarArea: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgb(66, 133, 244, 0.5)',
        },
      ],
    },
  },
  radar: {
    data: {
      datasets: [
        {
          backgroundColor: 'rgba(66, 133, 244, 0.5)',
          borderColor: 'rgb(66, 133, 244)',
          borderWidth: 2,
          pointBorderColor: 'rgb(66, 133, 244)',
          pointBackgroundColor: 'rgb(66, 133, 244)',
        },
      ],
    },
  },
};

// Default options
const DEFAULT_OPTIONS = {
  line: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
      tooltips: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
            gridLines: {
              borderDash: [2],
              drawBorder: false,
              zeroLineColor: 'rgba(0,0,0,0)',
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2],
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
      },
    },
  },
  bar: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
      tooltips: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
            gridLines: {
              borderDash: [2],
              drawBorder: false,
              zeroLineColor: 'rgba(0,0,0,0)',
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2],
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
      },
    },
  },
  horizontalBar: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
      tooltips: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            gridLines: {
              display: true,
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
            gridLines: {
              display: false,
              borderDash: [2],
              drawBorder: false,
              zeroLineColor: 'rgba(0,0,0,0)',
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2],
            },
            ticks: {
              fontColor: 'rgba(0,0,0, 0.5)',
            },
          },
        ],
      },
    },
  },
  pie: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
    },
  },
  doughnut: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
    },
  },
  polarArea: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
    },
  },
  radar: {
    options: {
      responsive: true,
      legend: {
        display: true,
      },
    },
  },
};

const GENERATE_DATA = (options, type, defaultType) => {
  const mergeObjects = (target, source, options) => {
    const destination = target.slice();
    source.forEach((item, index) => {
      if (typeof destination[index] === 'undefined') {
        destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
      } else if (options.isMergeableObject(item)) {
        destination[index] = merge(target[index], item, options);
      } else if (target.indexOf(item) === -1) {
        destination.push(item);
      }
    });
    return destination;
  };
  return merge(defaultType[type], options, {
    arrayMerge: mergeObjects,
  });
};

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */
//

class Chart {
  constructor(element, data, options = {}) {
    this._element = element;
    this._data = data;
    this._options = options;
    this._type = data.type;
    this._canvas = null;
    this._chart = null;
    if (this._element) {
      Data.setData(element, DATA_KEY, this);
      Manipulator.addClass(this._element, CLASSNAME_CHARTS);
      this._chartConstructor();
    }
  }

  // Getters
  static get NAME() {
    return NAME;
  }

  // Public
  dispose() {
    Data.removeData(this._element, DATA_KEY);
    this._element = null;
  }

  update(data, config) {
    this._data = { ...this._data, ...data };
    this._chart.data = this._data;
    this._chart.update(config);
  }

  // Private
  _chartConstructor() {
    if (this._data) {
      this._createCanvas();
      this._chart = new Chartjs(this._canvas, {
        ...GENERATE_DATA(this._data, this._type, DEFAULT_DATA),
        ...GENERATE_DATA(this._options, this._type, DEFAULT_OPTIONS),
      });
    }
  }

  _createCanvas() {
    if (this._canvas) return;
    this._canvas = document.createElement('canvas');
    this._element.appendChild(this._canvas);
  }

  static jQueryInterface(data, options, type) {
    return this.each(function () {
      let chartData = Data.getData(this, DATA_KEY);

      if (!chartData && /dispose/.test(data)) {
        return;
      }

      if (!chartData) {
        const chartOptions = options
          ? GENERATE_DATA(options, type, DEFAULT_OPTIONS)
          : DEFAULT_OPTIONS[type];

        chartData = new Chart(this, {
          ...GENERATE_DATA(data, type, DEFAULT_DATA),
          ...chartOptions,
        });
      }

      if (typeof data === 'string') {
        if (typeof chartData[data] === 'undefined') {
          throw new TypeError(`No method named "${data}"`);
        }

        chartData[data](options, type);
      }
    });
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY);
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation - auto initialization
 * ------------------------------------------------------------------------
 */

// eslint-disable-next-line consistent-return
const IS_COMPLEX = (data) => {
  return (
    (data[0] === '{' && data[data.length - 1] === '}') ||
    (data[0] === '[' && data[data.length - 1] === ']')
  );
};

const CONVERT_DATA_TYPE = (data) => {
  if (typeof data !== 'string') return data;
  if (IS_COMPLEX(data)) {
    return JSON.parse(data.replace(/'/g, '"'));
  }
  return data;
};

const PARSE_DATA = (data) => {
  const dataset = {};
  Object.keys(data).forEach((property) => {
    if (property.match(/dataset.*/)) {
      const chartProperty = property.slice(7, 8).toLowerCase().concat(property.slice(8));
      dataset[chartProperty] = CONVERT_DATA_TYPE(data[property]);
    }
  });
  return dataset;
};

SelectorEngine.find('[data-chart]').forEach((el) => {
  if (
    Manipulator.getDataAttribute(el, 'chart') !== 'bubble' &&
    Manipulator.getDataAttribute(el, 'chart') !== 'scatter'
  ) {
    const dataSet = Manipulator.getDataAttributes(el);
    const dataAttr = {
      data: {
        datasets: [PARSE_DATA(dataSet)],
      },
    };
    if (dataSet.chart) {
      dataAttr.type = dataSet.chart;
    }
    if (dataSet.labels) {
      dataAttr.data.labels = JSON.parse(dataSet.labels.replace(/'/g, '"'));
    }
    return new Chart(el, {
      ...GENERATE_DATA(dataAttr, dataAttr.type, DEFAULT_DATA),
      ...DEFAULT_OPTIONS[dataAttr.type],
    });
  }
  return null;
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .chart to jQuery only if jQuery is present
 */

const $ = getjQuery();

if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Chart.jQueryInterface;
  $.fn[NAME].Constructor = Chart;
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Chart.jQueryInterface;
  };
}

export default Chart;
