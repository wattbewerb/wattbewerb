function validateNumber(length) {
    return function(value) {
        var lengthInvalid = false;
        if (length && value.length !== length) {
            lengthInvalid = true;
        }
        
        return !(value.length && (lengthInvalid || isNaN(new Number(value))));
    }
}

function validateAndHighlight(length) {
    var validate = validateNumber(length);
    return function(event) {
        var $this = $(this);
        var value = $this.val();
        
        if (validate(value)) {
            $this.addClass('error');
        } else {
            $this.removeClass('error');
        }
    }
}

var validateSchluessel = validateNumber(8);
var validateEinwohner = validateNumber();

function onHashChanged() {
    if (location.hash.length > 1) {
        var vals = location.hash.split('#').pop().split('/');
        $('#gemeindeschluessel').val(vals[0]);
        $('#einwohnerzahl').val(vals[1]);

        resetResult();
        var schluessel = $('#gemeindeschluessel').val();
        var einwohner = $('#einwohnerzahl').val();

        if (validateSchluessel(schluessel) && validateEinwohner(einwohner)) {
            calculateData(schluessel, einwohner);
        }
    }
}

$(document).ready(function () {
    $(window).on('hashchange', onHashChanged);
    
    $('#submit').on('mouseup', function (event) {
        var schluessel = $('#gemeindeschluessel').val();
        var einwohner = $('#einwohnerzahl').val();

        if (schluessel && einwohner) {
            resetResult();
            calculateData(schluessel, einwohner);
        }
    });

    $('#gemeindeschluessel').on('keyup', validateAndHighlight(8));
    $('#einwohnerzahl').on('keyup', validateAndHighlight());

    onHashChanged();
});


function calculateData(schluessel, einwohner) {
    var timeout;
    $.ajax('/api/watt-info/' + schluessel + '/' + einwohner, {
        beforeSend: function() {
            $('#loading').show();
        },
        success: function(data) {
            $('#loading').hide();
            $('#result').css({ visibility: 'visible', display: 'none' });
            $('#result').fadeIn(300);
            $('#result .table').css({ visibility: 'visible', display: 'none' });
            $('#result .table').delay( 1000 ).fadeIn( 300 );
            
            displayResult(data);
        }
    })
}

function resetResult() {
    $('#result').css({ visibility: 'hidden' });
    $('#result .table').css({ visibility: 'hidden' });
    
    $('#result h1').text('');

    $('#result .big .total span.value').text('0');
    $('#result .big .anlagen span.value').text('0');
    $('#result .big .perResident span.value').text('0');
}

// {
//     ort,
//     netzbetreiberName,
//     gemeindeSchluessel,
//     start: {
//         dateFrom: fromDate?.format('DD.MM.YYYY'),
//         dateTo: toDate?.format('DD.MM.YYYY'),
//         total: {
//             kwp: total,
//             anlagen: data.length,
//             module: totalModule,
//             wpPerResident: perResidentNow,
//         },
//         geprueft: {
//             kwp: geprueft,
//             anlagen: geprueftData.length,
//             module: geprueftModule,
//             wpPerResident: geprueftPerResidentNow,
//         },
//         inPruefung: {
//             kwp: inPruefung,
//             anlagen: inPruefungData.length,
//             module: inPruefungModule,
//             wpPerResident: inPruefungPerResidentNow,
//         },
//     },
//     growth: [],
//     secs: durationInSec,
// }
function displayResult(data) {
    $('#result h1').text(data.ort);

    window.setTimeout(function() {
        const startTotal = data.start.total;
        animateInt($('#result .big.start .total span.value'), 0, startTotal.kwp, 1000);
        animateInt($('#result .big.start .anlagen span.value'), 0, startTotal.anlagen, 1000);
        animateDecimal($('#result .big.start .perResident span.value'), 0, startTotal.wpPerResident, 1000);
    }, 300);

    const geprueft = data.start.geprueft;
    $('#result .big.checked .total span.value').text(formatInt(geprueft.kwp));
    $('#result .big.checked .anlagen span.value').text(formatInt(geprueft.anlagen));
    $('#result .big.checked .perResident span.value').text(formatDecimal(geprueft.wpPerResident));
    
    const inPruefung = data.start.inPruefung;
    $('#result .big.unchecked .total span.value').text(formatInt(inPruefung.kwp));
    $('#result .big.unchecked .anlagen span.value').text(formatInt(inPruefung.anlagen));
    $('#result .big.unchecked .perResident span.value').text(formatDecimal(inPruefung.wpPerResident));
}



function formatInt(val) {
    return new Number(val).toLocaleString(
        'de', // --> browser locale
        { minimumFractionDigits: 0 }
      );
}

function formatDecimal(val) {
    return new Number(val).toLocaleString(
        'de', // --> browser locale
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      );
}


function animateInt($el, start, end, duration) {
    let startTimestamp = null;
    const step = function(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        $el.text(formatInt(val));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


function animateDecimal($el, start, end, duration) {
    let startTimestamp = null;
    const step = function(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = progress * (end - start) + start;
        $el.text(formatDecimal(val));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function textToClipboard(el) {
    var textToCopy = $(el).val()
    textToCopy.select();
    document.execCommand('copy');
}
