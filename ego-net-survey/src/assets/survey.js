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
            name: "matrix-t1",
            elements: [{
                type: "m-question",
                title: "Matrix Representation",
                description: "Please rate the following statements about the matrix representation of the ego-network.",
            }, {
                type: "text",
                placeHolder: "Enter your answer here...",
                inputType: "number",
                isRequired: true,
                name: "matrix-t1-answer"
            }]
        },
        {
            name: "nodelink-t1",
            elements: [{
                type: "nl-question",
                title: "Node-Link Representation",
                description: "Please rate the following statements about the node-link representation of the ego-network.",
            }, {
                type: "text",
                placeHolder: "Enter your answer here...",
                inputType: "number",
                isRequired: true,
                name: "nodelink-t1-answer"
            }]
        },
        {
            name: "radial-t1",
            elements: [{
                type: "r-question",
                title: "Radial Representation",
                description: "Please rate the following statements about the radial representation of the ego-network.",
            }, {
                type: "text",
                placeHolder: "Enter your answer here...",
                inputType: "number",
                isRequired: true,
                name: "radial-t1-answer"
            }]
        },
        {
            name: "layered-t1",
            elements: [{
                type: "l-question",
                title: "Layered Representation",
                description: "Please rate the following statements about the layered representation of the ego-network.",
            }, {
                type: "text",
                placeHolder: "Enter your answer here...",
                inputType: "number",
                isRequired: true,
                name: "layered-t1-answer"
            }]
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
                    displayMode: "buttons"
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
                    displayMode: "buttons"
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
                    displayMode: "buttons"
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
                    displayMode: "buttons"
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
