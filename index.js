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
  $('#select-error').selectmenu({ change: createFreqTable });
  $('#select-invalid').selectmenu({ change: createFreqTable });

  createFreqTable();
});

function getError(expect, actual) {
  return Math.abs(actual - expect) / expect;
}

function setErrorClass(element, expect, actual) {
  var error = getError(expect, actual) * 100;

  if (error >= 47.0)
    element.addClass('freq-error50');
  else if (error >= 21.0)
    element.addClass('freq-error30');
  else if (error >= 10.0)
    element.addClass('freq-error10');
  else if (error >= 4.7)
    element.addClass('freq-error5');
  else if (error >= 2.1)
    element.addClass('freq-error3');
  else if (error >= 1.0)
    element.addClass('freq-error1');
  else if (error >= 0.47)
    element.addClass('freq-error05');
  else if (error >= 0.21)
    element.addClass('freq-error03');
  else if (error >= 0.1)
    element.addClass('freq-error01');
  else if (error >= 0.047)
    element.addClass('freq-error005');
  else if (error >= 0.021)
    element.addClass('freq-error003');
  else if (error >= 0.01)
    element.addClass('freq-error001');
}

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

function createFreqTable() {
  var master = $('.spinner-master').val() * 1.0e6;
  var basefreq = $('.spinner-basefreq').val() * 1.0;
  var transpose = $('.spinner-transpose').val() | 0;
  var block = $('.spinner-block').val() | 0;
  var roundingType = $('#select-rounding').prop("selectedIndex");
  var showError = $('#select-error').prop("selectedIndex") == 0;
  var showInvalid = $('#select-invalid').prop("selectedIndex") == 0;
  var fmmode = $('#button-type-fm').prop('checked');

  $('.spinner-block').spinner(fmmode ? 'enable' : 'disable');

  $('#table-freq').empty();

  for (var octave = -1, note = 0; octave < 8; octave++) {
    var row = $('<div class="row"></div>');

    for (var i = 0; i < 12; i++, note++) {
      var freq = basefreq * Math.pow(2.0, (note + transpose - 69) / 12.0);
      var num;

      if (fmmode)
        num = (144.0 * freq * Math.pow(2.0, 20.0) / master) / Math.pow(2.0, block - 1.0);
      else
        num = master / (freq * 64.0);
      
      var num_round = rounding(roundingType, num);
      var element = $('<div class="col-xs-1 freq freq-item"></div>');
      element.text(num_round | 0 + "");

      if (showInvalid && (num_round >= (fmmode ? 2048 : 4096) || num_round <= 0))
        element.addClass('freq-invalid');
      else if(showError)
        setErrorClass(element, num, num_round);

      row.append(element);
    }

    $('#table-freq').append(row);
  }
}
