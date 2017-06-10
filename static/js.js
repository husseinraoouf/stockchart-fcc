const socket = new WebSocket('ws://localhost:8080');

$(document).ready(function() {

    $("form").submit(function(e){
        e.preventDefault();
        var name = $('input:last').val().toUpperCase();
        $('input:last').val("");
        $.ajax({
            url: '/addChart?name=' + name,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var chart = $('#container').highcharts();

                chart.addSeries({
                    id: name,
                    name: name,
                    data: data.chart
                });
                $('.stocks-container').prepend('<div class="col-md-4 col-sm-6 stock-block" id="' + name + '"> \
                    <h3>' + name + ' <button type="button" class="close">×</button></h3> \
                    <span class="name">' + data.longname + ' (' + name + ') Prices, Dividends, Splits and Trading Volume</span> \
                </div>')

                socket.send(JSON.stringify({add: true, name: name, chart: data.chart, longname: data.longname}));
            }
        });


    });


    $('.stocks-container').on("click", ".close", function() {
        var par = $(this).parent().parent();
        $.ajax({
            url: '/deleteChart?name=' + par.prop('id'),
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var chart = $('#container').highcharts();
                var series = chart.get(par.prop('id'));
                series.remove();
                par.remove();

                socket.send(JSON.stringify({add: false, name: par.prop('id')}));
            }
        });
    });

    socket.addEventListener('message', function (event) {

        var data = JSON.parse(event.data);

        // console.log();
        if (data.add) {
            var chart = $('#container').highcharts();

            chart.addSeries({
                id: data.name,
                name: data.name,
                data: data.chart
            });

            $('.stocks-container').prepend('<div class="col-md-4 col-sm-6 stock-block" id="' + data.name + '"> \
                <h3>' + data.name + ' <button type="button" class="close">×</button></h3> \
                <span class="name">' + data.longname + ' (' + data.name + ') Prices, Dividends, Splits and Trading Volume</span> \
            </div>')
        } else {

            var par = $(".stocks-container").children('#'+data.name);

            $.ajax({
                url: '/deleteChart?name=' + data.name,
                type: 'GET',
                dataType: 'json',
                success: function() {
                    var chart = $('#container').highcharts();
                    var series = chart.get(data.name);
                    series.remove();
                    par.remove();
                }
            });

        }




    });

});



function loadChart() {
    var chart = Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 5
        }
    });
};


Highcharts.theme = {
       colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
          '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
       chart: {
          backgroundColor: {
             linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
             stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
             ]
          },
          style: {
             fontFamily: '\'Unica One\', sans-serif'
          },
          plotBorderColor: '#606063'
       },
       title: {
          style: {
             color: '#E0E0E3',
             textTransform: 'uppercase',
             fontSize: '20px'
          }
       },
       subtitle: {
          style: {
             color: '#E0E0E3',
             textTransform: 'uppercase'
          }
       },
       xAxis: {
          gridLineColor: '#707073',
          labels: {
             style: {
                color: '#E0E0E3'
             }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          title: {
             style: {
                color: '#A0A0A3'

             }
          }
       },
       yAxis: {
          gridLineColor: '#707073',
          labels: {
             style: {
                color: '#E0E0E3'
             }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          tickWidth: 1,
          title: {
             style: {
                color: '#A0A0A3'
             }
          }
       },
       tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
             color: '#F0F0F0'
          }
       },
       plotOptions: {
          series: {
             dataLabels: {
                color: '#B0B0B3'
             },
             marker: {
                lineColor: '#333'
             }
          },
          boxplot: {
             fillColor: '#505053'
          },
          candlestick: {
             lineColor: 'white'
          },
          errorbar: {
             color: 'white'
          }
       },
       legend: {
          itemStyle: {
             color: '#E0E0E3'
          },
          itemHoverStyle: {
             color: '#FFF'
          },
          itemHiddenStyle: {
             color: '#606063'
          }
       },
       credits: {
          style: {
             color: '#666'
          }
       },
       labels: {
          style: {
             color: '#707073'
          }
       },

       drilldown: {
          activeAxisLabelStyle: {
             color: '#F0F0F3'
          },
          activeDataLabelStyle: {
             color: '#F0F0F3'
          }
       },

       navigation: {
          buttonOptions: {
             symbolStroke: '#DDDDDD',
             theme: {
                fill: '#505053'
             }
          }
       },

       // scroll charts
       rangeSelector: {
          buttonTheme: {
             fill: '#505053',
             stroke: '#000000',
             style: {
                color: '#CCC'
             },
             states: {
                hover: {
                   fill: '#707073',
                   stroke: '#000000',
                   style: {
                      color: 'white'
                   }
                },
                select: {
                   fill: '#000003',
                   stroke: '#000000',
                   style: {
                      color: 'white'
                   }
                }
             }
          },
          inputBoxBorderColor: '#505053',
          inputStyle: {
             backgroundColor: '#333',
             color: 'silver'
          },
          labelStyle: {
             color: 'silver'
          }
       },

       navigator: {
          handles: {
             backgroundColor: '#666',
             borderColor: '#AAA'
          },
          outlineColor: '#CCC',
          maskFill: 'rgba(255,255,255,0.1)',
          series: {
             color: '#7798BF',
             lineColor: '#A6C7ED'
          },
          xAxis: {
             gridLineColor: '#505053'
          }
       },

       scrollbar: {
          barBackgroundColor: '#808083',
          barBorderColor: '#808083',
          buttonArrowColor: '#CCC',
          buttonBackgroundColor: '#606063',
          buttonBorderColor: '#606063',
          rifleColor: '#FFF',
          trackBackgroundColor: '#404043',
          trackBorderColor: '#404043'
       },

       // special colors for some of the
       legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
       background2: '#505053',
       dataLabelsColor: '#B0B0B3',
       textColor: '#C0C0C0',
       contrastTextColor: '#F0F0F3',
       maskColor: 'rgba(255,255,255,0.3)'
};
