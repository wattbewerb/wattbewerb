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

        calculateData(schluessel, einwohner);
    });

    $('#gemeindeschluessel').on('keyup', validateNumber(8));
    $('#einwohnerzahl').on('keyup', validateNumber());
});

function calculateData(schluessel, einwohner) {
    $.ajax('/api/watt-info/' + schluessel + '/' + einwohner, {
        success: function(data) {
            debugger;
            console.dir(data);
        }
    })
}