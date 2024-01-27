export const surveyJson = {
    firstPageIsStarted: true,
    showPrevButton: false,
    showProgressBar: "top",
    pages: [
        {
            name: "intro",
            elements: [
                {
                    type: "html",
                    name: "question_intro",
                    html: `<h1>Start</h1>
                        <p>Please make sure you have read the slides about the user study before starting the survey.</p>
                        <p>Press the 'Start' button to start the survey</p>
                    `
                }
            ]
        },
        {
            name: "page1",
            elements: [{
                name: "FirstName",
                title: "Enter your first name:",
                type: "text"
            }, {
                name: "LastName",
                title: "Enter your last name:",
                type: "text"
            }]
        }]
};
