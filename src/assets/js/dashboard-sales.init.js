/*
Template Name: Minton - KowsarPanel
Author: MFZ
Website: http://www.kits.ir/
Contact: MIlad.mfz73@gmail.com
File: Sales Dashboard
*/


//
// Revenue Report Chart
//
var colors = ["#727cf5", "#e3eaef"];
var dataColors = $("#revenue-report").data('colors');
if (dataColors) {
    colors = dataColors.split(",");
}

var options = {
    chart: {
        height: 265,
        type: 'bar',
        stacked: true,
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '25%'
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    series: [{
        name: 'Actual',
        data: [65, 59, 80, 81, 56, 89, 40, 32, 65, 59, 80, 81]
    }, {
        name: 'Projection',
        data: [89, 40, 32, 65, 59, 80, 81, 56, 89, 40, 65, 59]
    }],
    zoom: {
        enabled: false
    },
    legend: {
        show: false
    },
    colors: colors,
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
            show: false
        },
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return val + "k"
            },
            offsetX: -15
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return "$" + val + "k"
            }
        },
    },
}

var chart = new ApexCharts(
    document.querySelector("#revenue-report"),
    options
);

chart.render();

//
// Products Sales Chart
//
var colors = ['#3bafda', '#1abc9c', "#f672a7"];
var dataColors = $("#products-sales").data('colors');
if (dataColors) {
    colors = dataColors.split(",");
}
var options = {
    chart: {
        height: 265,
        type: 'line',
        padding: {
            right: 0,
            left: 0
        },
        stacked: false,
        toolbar: {
            show: false
        }
    },
    stroke: {
        width: [1, 2],
        curve: 'smooth'
    },
    plotOptions: {
        bar: {
            columnWidth: '50%'
        }
    },
    colors: colors,
    series: [{
        name: 'Desktops',
        type: 'area',
        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
    }, {
        name: 'Laptops',
        type: 'line',
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
    }],
    fill: {
        opacity: [0.25, 1],
        gradient: {
            inverseColors: false,
            shade: 'light',
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100]
        }
    },
    labels: ['01/01/2020', '02/01/2020', '03/01/2020', '04/01/2020', '05/01/2020', '06/01/2020', '07/01/2020', '08/01/2020', '09/01/2020', '10/01/2020', '11/01/2020'],
    markers: {
        size: 0
    },
    legend: {
        offsetY: 5,
    },
    xaxis: {
        type: 'datetime'
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return val + "k"
            },
            offsetX: -10
        }
    },
    tooltip: {
        shared: true,
        intersect: false,
        y: {
            formatter: function (y) {
                if (typeof y !== "undefined") {
                    return y.toFixed(0) + " Dollars";
                }
                return y;

            }
        }
    },
    grid: {
        borderColor: '#f1f3fa',
        padding: {
            bottom: 10
        }
    }
}

var chart = new ApexCharts(
    document.querySelector("#products-sales"),
    options
);

chart.render();



//
// Marketing Reports
//
var colors = ["#727cf5", "#02a8b5", "#fd7e14"];
var dataColors = $("#marketing-reports").data('colors');
if (dataColors) {
    colors = dataColors.split(",");
}
var options = {
    chart: {
        height: 274,
        type: 'radar',
        toolbar: {
            show: false
        }
    },
    series: [{
        name: 'Series 1',
        data: [80, 50, 30, 40, 100, 20],
    }, {
        name: 'Series 2',
        data: [20, 30, 40, 80, 20, 80],
    }, {
        name: 'Series 3',
        data: [44, 76, 78, 13, 43, 10],
    }],
    stroke: {
        width: 0
    },
    fill: {
        opacity: 0.4
    },
    markers: {
        size: 0
    },
    legend: {
        show: false
    },
    colors: colors,
    labels: ['2011', '2012', '2013', '2014', '2015', '2016']
}

var chart = new ApexCharts(
    document.querySelector("#marketing-reports"),
    options
);

chart.render();


//
// Projections Vs Actuals Charts
//
var colors = ["#39afd1", "#ffbc00", "#313a46", "#fa5c7c"];
var dataColors = $("#projections-actuals").data('colors');
if (dataColors) {
    colors = dataColors.split(",");
}
var options = {
    chart: {
        height: 312,
        type: 'donut',
    },
    series: [44, 55, 41, 17],
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        verticalAlign: 'middle',
        floating: false,
        fontSize: '14px',
        offsetX: 0,
        offsetY: 7
    },
    labels: ["Direct", "Affilliate", "Sponsored", "E-mail"],
    colors: colors,
    responsive: [{
        breakpoint: 600,
        options: {
            chart: {
                height: 240
            },
            legend: {
                show: false
            },
        }
    }]
}

var chart = new ApexCharts(
    document.querySelector("#projections-actuals"),
    options
);

chart.render();

// Vector map
//various examples
$('#world-map-markers').vectorMap({
    map: 'world_mill_en',
    normalizeFunction: 'polynomial',
    hoverOpacity: 0.7,
    hoverColor: false,
    regionStyle: {
        initial: {
            fill: '#d4dadd'
        }
    },
    markerStyle: {
        initial: {
            r: 9,
            'fill': '#1abc9c',
            'fill-opacity': 0.9,
            'stroke': '#fff',
            'stroke-width': 7,
            'stroke-opacity': 0.4
        },

        hover: {
            'stroke': '#fff',
            'fill-opacity': 1,
            'stroke-width': 1.5
        }
    },
    backgroundColor: 'transparent',
    markers: [{
        latLng: [41.90, 12.45],
        name: 'Vatican City'
    }, {
        latLng: [43.73, 7.41],
        name: 'Monaco'
    }, {
        latLng: [-0.52, 166.93],
        name: 'Nauru'
    }, {
        latLng: [-8.51, 179.21],
        name: 'Tuvalu'
    }, {
        latLng: [43.93, 12.46],
        name: 'San Marino'
    }, {
        latLng: [47.14, 9.52],
        name: 'Liechtenstein'
    }, {
        latLng: [7.11, 171.06],
        name: 'Marshall Islands'
    }, {
        latLng: [17.3, -62.73],
        name: 'Saint Kitts and Nevis'
    }, {
        latLng: [3.2, 73.22],
        name: 'Maldives'
    }, {
        latLng: [35.88, 14.5],
        name: 'Malta'
    }, {
        latLng: [12.05, -61.75],
        name: 'Grenada'
    }, {
        latLng: [13.16, -61.23],
        name: 'Saint Vincent and the Grenadines'
    }, {
        latLng: [13.16, -59.55],
        name: 'Barbados'
    }, {
        latLng: [17.11, -61.85],
        name: 'Antigua and Barbuda'
    }, {
        latLng: [-4.61, 55.45],
        name: 'Seychelles'
    }, {
        latLng: [7.35, 134.46],
        name: 'Palau'
    }, {
        latLng: [42.5, 1.51],
        name: 'Andorra'
    }, {
        latLng: [14.01, -60.98],
        name: 'Saint Lucia'
    }, {
        latLng: [6.91, 158.18],
        name: 'Federated States of Micronesia'
    }, {
        latLng: [1.3, 103.8],
        name: 'Singapore'
    }, {
        latLng: [0.33, 6.73],
        name: 'SÃ£o TomÃ© and PrÃ­ncipe'
    }]
});