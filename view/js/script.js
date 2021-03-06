//variables
const headers = ['Session ID', 'Session Name', 'Date', 'Day'];
let email = '';
let password = '';
$(function () {

    function init() {
        $('#table-header').html('');
        $('#table-body').html('');
    }

    function login(event) {
        event.preventDefault();
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
                $("#error-message").remove();
                if (response) {
                    let sessionToken = response.authToken
                    getProfile(sessionToken);
                } else {
                    let errorMessage = response.errorCode;
                    switch (errorMessage) {
                        case 'INVALID_CREDENTIALS':
                            errorMessage = "Invalid Credentials."
                            break;
                        default:
                            errorMessage = "Something went wrong."
                    }
                    $("#formContent").append(`<p id="error-message" class="text-danger">${errorMessage}</p>`);
                }
            },
            complete: function () {
                // Hide login form.
                // $("#login-form").css('display', 'none');
            },
            error: function (xhr) {
                alert("An error occured: " + xhr.status + " " + xhr.statusText);
            }
        });

    };

    function getProfile(sessionToken) {
        $.get("https://bootcampspot.com/broker/me?authToken=" + sessionToken, function (response) {
            let userInfo = response.userAccount;
            let courseInfo = response.enrollments[0];
            let enrollmentId = courseInfo.id;
            setUserInfo(userInfo);
            setCourseInfo(courseInfo);
            $(".navbar").css('visibility', 'visible');
            getSessions(sessionToken, enrollmentId);
        });
    }

    //Todo: add a function to select a bootcamp and pass enrollmentId dynamically

    // function showCohurts() {

    // }

    function setUserInfo(userInfo) {
        let image_url = userInfo.nexusAvatarUrl ? ` <img alt="${userInfo.firstName} Profile" src="https://bootcampspot.com${userInfo.nexusAvatarUrl}" class="fill rounded " width="30" height="30" ></img>` : '';
        $("#user-name").html(`${userInfo.firstName} ${userInfo.lastName}${image_url}`);
    }

    function setCourseInfo(courseInfo) {
        $("#course-info").html(`${courseInfo.course.cohort.program.name}`);
    }

    function getSessions(sessionToken, enrollmentId) {
        $.ajax({
            url: `https://bootcampspot.com/broker/sessions`,
            type: 'POST',
            data: JSON.stringify({ enrollmentId: enrollmentId }),
            contentType: 'application/json; charset=utf-8',
            headers: {
                authtoken: sessionToken
            },
            beforeSend: function () {
                // Hide login form.
                $("#login-form").css('display', 'none');
                // Display loader while profile-view is loading.
                $("#loader-view").css('display', 'block');
            },
            success: function (response) {
                let data = response.calendarSessions;
                //Add headers to table-header
                $('#table-header').append('<tr>');
                var headerRow = $('#table-header tr');
                $.each(headers, function (index, value) {
                    headerRow.append(`<th scope="col">${value}</th>`);
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
                                let urlList = response.session.videoUrlList;
                                if (urlList.length > 0) {
                                    sessionURL = urlList[0].url;
                                }
                                name = sessionURL ? `<a href='${sessionURL}' target='_blank'>${name}</a>` : name;

                                if (urlList.length > 1) {
                                    let i;
                                    for (i = 1; i < urlList.length; i++) {
                                        let additionalURL = urlList[i].url;
                                        name += `, <a href='${additionalURL}' target='_blank'>[${i + 1}]</a>`;
                                    }
                                }

                                // Add rows to table-body
                                var row = $(`<tr><td>${chapterNo}</td><td>${name}</td><td>${sessionDate}</td><td>${sessionDay}</td>`);
                                $('#table-body').append(row);
                            }
                        });
                    }
                });
            },
            complete: function () {
                // Hide loader once sessions-view is loaded.
                $("#loader-view").css('display', 'none');
                // Display sessions-view.
                $("#sessions-view").css('display', 'block');

            }
        });
    }

    function exportTableToExcel(tableID = 'sessions-table', filename = '') {
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20').replace('#', '%23').replace(',', '%2C');

        // Specify file name
        filename = filename ? filename + '.xls' : 'sessions.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if (navigator.msSaveOrOpenBlob) {
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
            // Setting the file name
            downloadLink.download = filename;
            //triggering the function
            downloadLink.click();
        }
    }

    //event handlers
    $("#login-btn").click(login);
    $("#download-btn").click(exportTableToExcel);
    init();
});