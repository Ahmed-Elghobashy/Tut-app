// Import necessary modules
// import OpenAI from "openai";

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const { coerceInteger } = require('openai/core');
const openai = new OpenAI({
    apiKey: "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",
});


// Set up Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:admin@cluster0.eofgaev.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Tutor and Student models
const Tutor = mongoose.model('tutor', new mongoose.Schema({
    name: String,
    subject: String,
    grades: [Number],
    availability: [{ day: String, slots: [Number] }],
}));

/*
studentPreferences = {
    subject : String ,
    grade : Number ,
    classes :
    [{
    duration : Number,
    prefTime : [{day: String, slots: [Number]}]
    }],
}
*/
const Student = mongoose.model('student', new mongoose.Schema({
    name: String,
}));

const studentfav = mongoose.model('students_favorite', new mongoose.Schema({
    studentName: String,
    tutorName: String,
    fitScore: Number,
}));


// Matching Logic
app.post('/match', async (req, res) => {
    try {
        console.log("I got a request", req.body.classes[0].prefTime);
        const studentPreferences = req.body;

        const sortedTutors = await matchTutors(studentPreferences);
        res.json({ matchedTutors: sortedTutors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/ai", async (req, res) => {
    try {
        const studentPreferences = await gpt(req.body.message);
        const sortedTutors = await matchTutors(studentPreferences);
        console.log(sortedTutors);
        res.json({ matchedTutors: sortedTutors });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Internal Server Error' });

    }

});

app.post("/addToFav", async (req, res) => {
    try {

        const { studentName, tutorName, fitScore } = req.body;

        // Create a new instance of the model with the received data
        const newFavorite = new studentfav({
            studentName,
            tutorName,
            fitScore,
        });

        // Save the newFavorite document to the database
        const savedFavorite = await newFavorite.save();

        // Send a success response
        res.status(201).json(savedFavorite);

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Internal Server Error' });

    }

});


async function gpt(userInput) {

    console.log("will start testing now with : ", userInput);
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "you are a helpful assistant that will help by returning the json which will be used to call the  function getStudentPreferences. you use the 24h format and the duration is in hours" },
            { role: "user", content: `${userInput}` }

        ],
        tools: tools,
        tool_choice: "auto"
    });

    const responseMessage = completion.choices[0].message;
    console.log(responseMessage);

    if (responseMessage.tool_calls) {
        // call the function
        // Note: the JSON response may not always be valid; be sure to handle errors
        const toolCall = responseMessage.tool_calls[0];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log(functionArgs);
        console.log(functionArgs.classes[0].prefTime)
        return functionArgs;
    }
}


async function matchTutors(studentPreferences) {
    let matchingTutors = await Tutor.find(
        {
            subject: studentPreferences.subject
        });

    matchingTutors = matchingTutors.filter((tutor) => tutor.grades.includes(studentPreferences.grade));

    console.log("matchTutors", matchingTutors)
    // Calculate fit score and sort tutors by fit score
    const tutorsWithFitScore = matchingTutors.map((tutor) => {
        const fitScore = calculateFitScore(studentPreferences, tutor);
        return { tutor, fitScore };
    });

    const sortedTutors = tutorsWithFitScore.sort((a, b) => b.fitScore - a.fitScore);

    // console.log(sortedTutors);
    return sortedTutors;
}

// Function to calculate fit score
function calculateFitScore(studentPreferences, tutor) {

    let fitScore = 0;

    // Number of classes match
    const noClassMatch = studentPreferences.classes.length <= tutor.availability.length;
    fitScore += noClassMatch ? 10 : 0;

    for (const classPref of studentPreferences.classes) {
        console.log(classPref.prefTime);
        for (const preferredDay of classPref.prefTime) {
            const availableSlots = tutor.availability.find((slot) => slot.day === preferredDay.day)?.slots;
            if (!availableSlots) break;


            // Preferred days with slots (consecutive) that are equal to the duration available and in the prefered time slot = 15
            const hasConsecutiveSlotsAndTimeMatch = hasConsecutiveSlotsMatchingDurationAndTime(
                availableSlots,
                preferredDay.slots,
                classPref.duration,
            );

            // Preferred days with slots (consecutive) that are equal to the duration available = 10
            const hasConsecutiveSlotsWithoutTimeMatch = hasConsecutiveSlots(
                availableSlots,
                classPref.duration
            );

            if (hasConsecutiveSlotsAndTimeMatch) {
                fitScore += 15; // Add 15 if consecutive slots match duration and time
            } else if (hasConsecutiveSlotsWithoutTimeMatch) {
                fitScore += 10; // Add 10 if only consecutive slots match duration
            }
        }
    }

    // fitScore = 1 means fits all the preferd slots , =0 doesn't fit any requirements 
    return (fitScore / (studentPreferences.classes.length * 25));
}

function hasConsecutiveSlotsMatchingDurationAndTime(availableSlots, preferredSlots, duration) {

    if (!availableSlots || !preferredSlots) return false;
    const intersection = preferredSlots.filter(slot => availableSlots.includes(slot));


    max = maxConsecutiveSlots(intersection, duration);

    return max >= duration;
}

function hasConsecutiveSlots(availableSlots, duration) {

    if (!availableSlots) return false;
    max = maxConsecutiveSlots(availableSlots, duration);
    // console.log("availableSlots: ", availableSlots, "max", max);
    return max >= duration;
}
function maxConsecutiveSlots(arr) {
    let max = 0, curr = 0, prev = -2;
    for (const i of arr) {
        if (i != prev + 1)
            curr = 1;
        else
            curr++;
        prev = i;
        max = Math.max(max, curr);
    }

    return max;
}




const tools = [{
    type: "function",
    function:
    {
        name: "getStudentPreferences",
        parameters: {
            type: "object",
            properties: {
                subject: {
                    type: "string",
                    enum: ["maths", "science", "arabic"]

                },
                grade: {
                    type: "number"
                },
                classes: {
                    type: "array",
                    description: "each entry represents one class with its prefered timing, if the student wants two classes per week there should be two entries in the array",
                    items: {
                        type: "object",
                        properties: {
                            duration: {
                                type: "integer",
                                description: "the duration in hours if they want a 1 hour class value here is 1"
                            },
                            prefTime: {
                                type: "array",
                                description: "array of the prefered time by the student for the class,for example if the student wants the weekend it should have two array elements one for saturday and one for sunday",
                                items: {
                                    type: "object",
                                    properties: {
                                        day: {
                                            type: "string",
                                            enum: [
                                                "saturday",
                                                "sunday",
                                                "monday",
                                                "tuesday",
                                                "wednesday",
                                                "thursday",
                                                "friday"
                                            ]
                                        },
                                        slots: {
                                            type: "array",
                                            items: {
                                                type: "integer"
                                            },
                                            description: "array of time slots describing the hours available by the tutor in 24h format. Example: [16,17] means it is available from 4 pm-6 pm."
                                        }
                                    },
                                    required: [
                                        "day",
                                        "slots"
                                    ],
                                }
                            }
                        },
                        required: [
                            "duration",
                            "prefTime"
                        ]
                    }
                }
            },
            required: [
                "subject",
                "grade",
                "classes"
            ]
        },
        description: "a function that takes a list of arguments related to the required subject and grade and student preferred class times and does something with it"
    }
}
]


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
