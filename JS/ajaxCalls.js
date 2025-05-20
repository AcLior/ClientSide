function ajaxCall(method, api, data, successCB, errorCB) {
    return $.ajax({
        type: method,
        url: api,
        data: data,
        cache: false,
        contentType: "application/json",
        dataType: "json",
        async: true,
        success: successCB,
        error: errorCB
    });
}