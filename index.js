var notechars = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// utils functions

function rounding(type, value) {
  switch(type) {
    case 1:
    return Math.floor(value);
    case 2:
    return Math.ceil(value);
    default:
    return Math.round(value);
  }
}

function getError(expect, actual) {
  return Math.abs(actual - expect) / expect;
}

// 

$(function() {
  $('.button-type').buttonset().click(createFreqTable);
  $('#spinner-master').spinner({
    min: 0.7,
    max: 4.2,
    step: 0.01,
    spin: createFreqTable,
    stop: createFreqTable
  })
  $('#spinner-basefreq').spinner({
    min: 420.0,
    max: 460.0,
    step: 0.1,
    spin: createFreqTable,
    stop: createFreqTable
  });
  $('#spinner-transpose').spinner({
    min: -48,
    max: 48,
    step: 1,
    spin: createFreqTable,
    stop: createFreqTable
  });
  $('#spinner-block').spinner({
    min: 0,
    max: 7,
    step: 1,
    spin: createFreqTable,
    stop: createFreqTable
  });
  $('#select-rounding').selectmenu({ change: createFreqTable });
  $('#select-error').selectmenu({
    change: function() {
      $('#table-error').stop(true)[($('#select-error').prop("selectedIndex") === 0) ? 'fadeIn' : 'fadeOut']();
      createFreqTable();
    }
  });
  $('#select-invalid').selectmenu({ change: createFreqTable });

  createFreqTable();
});

function setErrorClass(element, expect, actual) {
  var error = getError(expect, actual) * 100;

  if (error >= 46.42)
    element.addClass('freq-error50');
  else if (error >= 21.54)
    element.addClass('freq-error30');
  else if (error >= 10.0)
    element.addClass('freq-error10');
  else if (error >= 4.642)
    element.addClass('freq-error5');
  else if (error >= 2.154)
    element.addClass('freq-error3');
  else if (error >= 1.0)
    element.addClass('freq-error1');
  else if (error >= 0.4642)
    element.addClass('freq-error05');
  else if (error >= 0.2154)
    element.addClass('freq-error03');
  else if (error >= 0.1)
    element.addClass('freq-error01');
  else if (error >= 0.04642)
    element.addClass('freq-error005');
  else if (error >= 0.02154)
    element.addClass('freq-error003');
  else if (error >= 0.01)
    element.addClass('freq-error001');
}

function calculateFreqNumber(fmmode, freq, master, block) {
  // 144 * 2^20 = 150994944
  return fmmode ? (150994944.0 * freq / master) / Math.pow(2.0, block - 1.0) :
                  master / (freq * 64.0);
}

function getFormValues() {
  return {
    master:       $('.spinner-master').val() * 1.0e6,
    basefreq:     $('.spinner-basefreq').val() * 1.0,
    transpose:    $('.spinner-transpose').val() | 0,
    block:        $('.spinner-block').val() | 0,
    roundingType: $('#select-rounding').prop("selectedIndex") | 0,
    showError:    $('#select-error').prop("selectedIndex") === 0,
    showInvalid:  $('#select-invalid').prop("selectedIndex") === 0,
    fmmode:       $('#button-type-fm').prop('checked')
  };
}

function createFreqTable() {
  var v = getFormValues();

  $('.spinner-block').spinner(v.fmmode ? 'enable' : 'disable');
  $('#table-freq').empty();

  for (var octave = -1, note = 0; octave <= 9; octave++) {
    var row = $('<div class="row"></div>');

    for (var i = 0; i < 12; i++, note++) {
      var freq = v.basefreq * Math.pow(2.0, (note + v.transpose - 69) / 12.0);
      var num = calculateFreqNumber(v.fmmode, freq, v.master, v.block);
      var num_round = rounding(v.roundingType, num);

      var element = $('<div class="col-xs-1 freq freq-item"></div>')
        .text(num_round | 0 + "")
        .mouseenter(showPopup(note))
        .mousemove(function(e) {
          $('.popup-freq')
            .css({
              left: (e.pageX + 20) + 'px',
              top: (e.pageY + 20) + 'px'
            })
        });

      if (v.showInvalid && (num_round >= (v.fmmode ? 2048 : 4096) || num_round <= 0))
        element.addClass('freq-invalid');
      else if(v.showError)
        setErrorClass(element, num, num_round);

      row.append(element);
    }

    $('#table-freq')
      .append(row)
      .mouseleave(function() { $('.popup-freq').hide(); });
  }
}

function showPopup(note) {
  return function(e) {
    var v = getFormValues();
    var freq = v.basefreq * Math.pow(2.0, (note + v.transpose - 69) / 12.0);
    var num = calculateFreqNumber(v.fmmode, freq, v.master, v.block);
    var num_round = rounding(v.roundingType, num);
    var error = getError(num, num_round) * 100.0;

    $('#popup-midinum').text(notechars[note % 12] + (((note / 12) | 0) - 1));
    $('#popup-notenum').text(note);
    $('#popup-freq').text(Math.round(freq * 10.0) / 10.0);
    $('#popup-num').text(num_round);
    $('#popup-error').text(Math.round(error * 100.0) / 100.0 + '');
    $('.popup-freq').show();
  }
}
