export const SURVEY_JSON = {
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
                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>
                            <b>Network visualizations show connections between entities, called edges and nodes respectively.</b> 
                            Network visualizations are used across application domains.
                            For example, in social network analysis, nodes represent people and edges represent different types of relationships between them. 
                        </p>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>
                            Many different types of such networks exist, such as multivariate networks, multilayer networks, and compound graphs, just to name a few. In this study, however, we are particularly interested in studying so-called <b>ego networks</b>. An ego network represents connections relative to a particular focal node, the so-called <b>ego</b>. In other words: instead of visualizing an entire network, we only visualize nodes and edges important to the ego, i.e. its neighbors, its neighbors' neighbors, etc.. 
                        </p>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>
                            However, such <b>ego networks can be represented in many different ways</b>, each with its own advantages and drawbacks. In this study, you will solve six tasks for a particular ego network representation. You will receive more detailed instructions and explanations regarding each representation and task once you start the study.
                        </p>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                    <p>
                    The study itself consists of the following:

                    <ol style="list-style-type: decimal; padding-left: 2rem;">
                        <li>An anonymized, short questionnaire about your demographic information and background knowledge of networks</li>
                        <li>Six questions that you will be tasked to complete as quickly and accurately as possible</li>
                        <li>A final questionnaire for you to provide optional and mandatory qualitative feedback</li>
                    </ol>
                    </p>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>Overall, we estimate the study to require 20-30 minutes of your time. Your participation is voluntary, and you can decide to cancel your participation at any time. However, you will not receive any compensation if you do not finish the study, following Prolific's cancellation policy. In order to participate in this study, please ensure that:</p>
                    <ul style="list-style-type: disc; padding-left: 2rem;">
                        <li>You are not color-blind or suffer from any other vision impairments</li>
                        <li>You are using a large desktop or laptop monitor, i.e. not a smartphone or tablet.</li>
                        <li>You do not navigate forth and back using the browser controls or refresh the page.</li>
                    <ul>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>We will store the following information if you finish the study:</p>
                        <ul style="list-style-type: disc; padding-left: 2rem;">
                            <li>Your prolific ID and provided demographic information at the beginning of the study</li>
                            <li>Your input to the text answer fields during the tasks</li>
                            <li>Your preferences and optional feedback at the end of the study</li>
                        </ul>
                    </div>

                    <hr/>

                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>If you cancel the study at any time, your data will not be used. All collected data will be fully anonymous. Data will be temporarily stored on a university server, hosted by the research unit conducting the study, and moved to a university-hosted data repository directly after the study. Only the principal investigators of the study and the administrators of the university’s research unit have access to the data. The collected anonymous data and the findings derived therefrom will be used for a publication on network readability. For any further questions, you can contact the principal investigators of this study through Prolific's messenger function.</p>
                    </div>
                    `
                },
                {
                    type: "checkbox",
                    name: "question_intro_confirm",
                    title: "I confirm that I understand what is expected from me.",
                    choices: ["I confirm"],
                    isRequired: true,
                },
                {
                    type: "checkbox",
                    name: "question_intro_agree",
                    title: "I understand and agree with the data handling policy.",
                    choices: ["I confirm"],
                    isRequired: true,
                }
            ]
        },
        {
            name: "demographics",
            title: "Demographics",
            elements: [
                {
                    type: "text",
                    name: "prolific_id",
                    title: "Prolific ID",
                    isRequired: true,
                    inputType: "text",
                    placeHolder: "Prolific ID"
                },
                {
                    type: "radiogroup",
                    name: "gender",
                    title: "Gender",
                    isRequired: true,
                    colCount: 4,
                    choices: ["Female", "Male", "Other", "Prefer not to specify"]
                },
                {
                    type: "radiogroup",
                    name: "age",
                    title: "Age",
                    isRequired: true,
                    colCount: 3,
                    choices: ["18-20", "21-25", "26-30", "31-35", "36-40", "41-45", "46-50", "50+"]
                },
                {
                    type: "radiogroup",
                    name: "education",
                    title: "Highest finished education",
                    isRequired: true,
                    colCount: 5,
                    choices: ["None", "High School Diploma", "Bachelor's Degree", "Master's Degree", "PhD"]
                },
                {
                    type: "radiogroup",
                    name: "network_knowledge",
                    title: "How familiar / experienced are you with network visualizations (self-assessment)?",
                    isRequired: true,
                    colCount: 3,
                    choices: ["None", "Quite Familiar", "Expert"]
                }
            ]
        },
        {
            name: "feedback",
            title: "Feedback",
            elements: [
                {
                    type: "rating",
                    name: "ego-rep-learn",
                    title: "I found the ego network's visual representation easy to learn.",                    
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
                    name: "ego-rep-use",
                    title: "I found the ego network's visual representation easy to use.",
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
                    name: "ego-rep-aesth",
                    title: "I found the ego network's visual representation aesthetically pleasing.",
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
                    name: "ego-rep-acc",
                    title: "I found the ego network's visual representation allowed me to answer questions accurately.",
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
                    name: "ego-rep-quick",
                    title: "I found the ego networks visual representation allowed me to answer questions quickly.",
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
                    name: "ego-rep-like",
                    type: "comment",
                    title: "What did you like about the presented ego network's visual representation?",
                    placeHolder: "Please enter your personal comments:",
                    isRequired: false,
                },
                {
                    name: "ego-rep-dislike",
                    type: "comment",
                    title: "What did you dislike about the presented ego network's visual representation?",
                    placeHolder: "Please enter your personal comments:",
                    isRequired: false,
                }
            ]
        }
    ]
};
