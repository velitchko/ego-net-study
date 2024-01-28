export const surveyJson = {
    firstPageIsStarted: true,
    showPrevButton: false,
    showProgressBar: "bottom",
    showQuestionNumbers: "off",
    fitToContainer: true,
    widthMode: "static",
    width: "100%",
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
            name: "feedback",
            title: "Feedback",
            elements: [
                {
                    type: "rating",
                    name: "m",
                    title: "Matrix?",
                    description: "Numeric rating scale",
                    rateType: "smileys",
                    scaleColorMode: "colored",
                    rateCount: 5,
                    rateMax: 5,
                    displayMode: "buttons",
                    isRequired: true,
                    // autoGenerate: false,
                    // rateCount: 5,
                    // rateValues: [ 1, 2, 3, 4, 5 ]
                },
                {
                    type: "rating",
                    name: "nl",
                    title: "Node-Link?",
                    description: "Numeric rating scale",
                    rateType: "smileys",
                    scaleColorMode: "colored",
                    rateCount: 5,
                    rateMax: 5,
                    displayMode: "buttons",
                    isRequired: true,
                    // autoGenerate: false,
                    // rateCount: 5,
                    // rateValues: [ 1, 2, 3, 4, 5 ]
                },
                {
                    type: "rating",
                    name: "l",
                    title: "Layered?",
                    description: "Numeric rating scale",
                    rateType: "smileys",
                    scaleColorMode: "colored",
                    rateCount: 5,
                    rateMax: 5,
                    displayMode: "buttons",
                    isRequired: true,
                    // autoGenerate: false,
                    // rateCount: 5,
                    // rateValues: [ 1, 2, 3, 4, 5 ]
                },
                {
                    type: "rating",
                    name: "r",
                    title: "Radial?",
                    description: "Numeric rating scale",
                    rateType: "smileys",
                    scaleColorMode: "colored",
                    rateCount: 5,
                    rateMax: 5,
                    displayMode: "buttons",
                    isRequired: true,
                    // autoGenerate: false,
                    // rateCount: 5,
                    // rateValues: [ 1, 2, 3, 4, 5 ]
                },
                {
                name: "comments",
                type: "comment",
                title: "Please enter your personal comments:",
                placeHolder: "Comments...",
                isRequired: true,
                }
            ]
        }
    ]
};
