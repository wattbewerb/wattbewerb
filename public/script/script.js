function validateNumber(length) {
    return function(event) {
        var $this = $(this);
        var value = $this.val();

        var lengthInvalid = false;
        if (length && value.length !== length) {
            lengthInvalid = true;
        }
        
        if (value.length && (lengthInvalid || isNaN(new Number(value)))) {
            $this.addClass('error');
        } else {
            $this.removeClass('error');
        }
    }
}

$(document).ready(function () {
    $('#submit').on('mouseup', function (event) {
        var schluessel = $('#gemeindeschluessel').val();
        var einwohner = $('#einwohnerzahl').val();

        if (schluessel && einwohner) {
            resetResult();
            calculateData(schluessel, einwohner);
        }
    });

    $('#gemeindeschluessel').on('keyup', validateNumber(8));
    $('#einwohnerzahl').on('keyup', validateNumber());
});

function calculateData(schluessel, einwohner) {
    var timeout;
    $.ajax('/api/watt-info/' + schluessel + '/' + einwohner, {
        beforeSend: function() {
            $('#result').css({ visibility: 'hidden' });
            $('#result .table').css({ visibility: 'hidden' });
            timeout = window.setTimeout(function() {
                $('#loading').show();
            }, 100);
        },
        success: function(data) {
            // window.clearTimeout(timeout);
            
            window.setTimeout(function() {
                $('#loading').hide();
                $('#result').css({ visibility: 'visible', display: 'none' });
                $('#result').fadeIn(300);
                $('#result .table').css({ visibility: 'visible', display: 'none' });
                $('#result .table').delay( 1000 ).fadeIn( 300 );
                
                displayResult(data);
            }, 500);
        }
    })
}

function resetResult() {
    $('#result h1').text('');

    $('#result .big .total span.value').text('0');
    $('#result .big .anlagen span.value').text('0');
    $('#result .big .perResident span.value').text('0');

    // $('#result .end2020 .date').text(data.end2020.date);
    $('#result .end2020 .total').text('');
    $('#result .end2020 .anlagen').text('');
    $('#result .end2020 .perResident').text('');

    // $('#result .now .date').text(data.now.date);
    $('#result .now .total').text('');
    $('#result .now .anlagen').text('');
    $('#result .now .perResident').text('');

    $('#result .growth .total').text('');
    $('#result .growth .anlagen').text('');
    $('#result .growth .perResident').text('');
}

function displayResult(data) {
    $('#result h1').text(data.ort);

    window.setTimeout(function() {
        animateInt($('#result .big .total span.value'), 0, data.end2020.total, 1000);
        animateInt($('#result .big .anlagen span.value'), 0, data.end2020.anlagen, 1000);
        animateDecimal($('#result .big .perResident span.value'), 0, data.end2020.perResident, 1000);
    }, 300);

    $('#result .end2020 .total').text(formatInt(data.end2020.total) + ' kWp');
    $('#result .end2020 .anlagen').text(formatInt(data.end2020.anlagen));
    $('#result .end2020 .perResident').text(formatDecimal(data.end2020.perResident) + ' Wp/Einwohner');

    // $('#result .end2020 .date').text(data.end2020.date);
    $('#result .end2020 .total').text(formatInt(data.end2020.total) + ' kWp');
    $('#result .end2020 .anlagen').text(formatInt(data.end2020.anlagen));
    $('#result .end2020 .perResident').text(formatDecimal(data.end2020.perResident) + ' Wp/Einwohner');

    // $('#result .now .date').text(data.now.date);
    $('#result .now .total').text(formatInt(data.now.total) + ' kWp');
    $('#result .now .anlagen').text(formatInt(data.now.anlagen));
    $('#result .now .perResident').text(formatDecimal(data.now.perResident) + ' Wp/Einwohner');

    $('#result .growth .total').text(formatInt(data.now.total - data.end2020.total) + ' kWp');
    $('#result .growth .anlagen').text(formatInt(data.now.anlagen - data.end2020.anlagen));
    $('#result .growth .perResident').text(formatDecimal(data.now.perResident - data.end2020.perResident) + ' Wp/Einwohner');
}

function formatInt(val) {
    return new Number(val).toLocaleString(
        undefined, // --> browser locale
        { minimumFractionDigits: 0 }
      );
}

function formatDecimal(val) {
    return new Number(val).toLocaleString(
        undefined, // --> browser locale
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
