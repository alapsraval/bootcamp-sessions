const headers = ['Chapter #', 'Name', 'Date', 'Day'];
var sessionToken = '';
$(function () {

    function getProfile(sessionToken) {
        $.get( "https://bootcampspot.com/broker/me?authToken=" + sessionToken, function(response) {
            $( "#user-name" ).html(`${response.userAccount.firstName} ${response.userAccount.lastName} <img alt="${response.userAccount.firstName} Profile" src="https://bootcampspot.com/broker/studentAvatar?accountId=${response.userAccount.id}" class="fill rounded " width="30" height="30" >`);
          });
    }

    $('#table-header').html('');
    $('#table-body').html('');
    function getSessions(sessionToken) {
        $.ajax({
            url: `https://bootcampspot.com/broker/sessions`,
            type: 'POST',
            data: JSON.stringify({ enrollmentId: 344747 }),
            contentType: 'application/json; charset=utf-8',
            headers: {
                authtoken: sessionToken
            },
            beforeSend: function () {
                // Display loader while profile-view is loading.
                $("#loader-view").css('display', 'block');
            },
            success: function (response) {
                let data = response.calendarSessions;
                //Add headers to table-header
                $('#table-header').append('<tr>');
                var headerRow = $('#table-header tr');
                $.each(headers, function (index, value) {
                    headerRow.append(`<th>${value}</th>`);
                });

                $.each(data, function (index, value) {
                    let session = value.session;
                    if (value.session.chapter !== "") {
                        let chapterNo = session.chapter;
                        let sessionDate = new Date(session.startTime).toLocaleDateString('en-US');
                        let sessionDay = new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' });
                        let name = session.name;
                        let sessionId = session.id;
                        let sessionURL = '';

                        $.ajax({
                            url: `https://bootcampspot.com/broker/sessionDetail`,
                            type: 'POST',
                            data: JSON.stringify({ sessionId: sessionId }),
                            contentType: 'application/json; charset=utf-8',
                            async: false,
                            headers: {
                                authtoken: sessionToken
                            },
                            success: function (response) {
                                sessionURL = response.session.videoUrlList.length > 0 ? response.session.videoUrlList[0].url : '';
                                name = sessionURL ? `<a href='${sessionURL}'>${name}</a>` : name;
                                // Add rows to table-body
                                var row = $(`<tr><td>${chapterNo}</td><td>${name}</td><td>${sessionDate}</td><td>${sessionDay}</td>`);
                                $('#table-body').append(row);
                            }
                        });
                    }
                });
            },
            complete: function () {
                // Hide loader once profile-view is loaded.
                $("#loader-view").css('display', 'none');
                // Display profile-view.
                $("#sessions-view").css('display', 'block');
            }
        });
    }

    $("#login-btn").click(function (event) {
        email = $("#login").val();
        password = $("#password").val();
        $.ajax({
            url: `https://bootcampspot.com/broker/login`,
            type: 'POST',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                sessionToken = response.authenticationInfo.authToken
                getProfile(sessionToken);
                getSessions(sessionToken);
            },
            complete: function () {
                // Hide login form.
                $("#login-form").css('display', 'none');
            }
        });

        event.preventDefault();

    });
});