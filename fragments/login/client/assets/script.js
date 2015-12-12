$('form.log-login').on('submit', function (event) {
    $(event.target).find('button[type=submit]').prop('disabled', true).text('Logging in ...');
});