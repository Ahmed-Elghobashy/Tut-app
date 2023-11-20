import React, { useState } from 'react';
import axios from 'axios';
import TutorComponent from '../TutorComponent/TutorComponent';

const ConventionalComponent = () => {
    const [selectedOption, setSelectedOption] = useState(0);
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [tutorResults, setTutorResults] = useState([]);
    const [dayComponents, setDayComponents] = useState([]);

    const handleDropdownChange = (event) => {
        setSelectedOption(parseInt(event.target.value, 10));
        setDayComponents([]);
    };

    const handleTutorSubmit = (tutor) => {
        setTutorResults([tutor]);
    };

    const handleSubmit = async () => {
        const classData = [];

        // Collect data from each DayComponent
        for (let i = 0; i < selectedOption; i++) {
            if (dayComponents[i]) {
                const classInfo = dayComponents[i].getData();
                classData.push(classInfo);
            }
        }

        // Submit the collected data
        try {
            const response = await axios.post('http://localhost:3001/match', {
                subject: subject,
                grade: parseInt(grade, 10),
                classes: classData,
            });

            console.log(response.data.matchedTutors);
            setTutorResults(response.data.matchedTutors);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <label>
                Select number of classes:
                <select value={selectedOption} onChange={handleDropdownChange}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((number) => (
                        <option key={number} value={number}>
                            {number}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Subject:
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>

            <label>
                Grade:
                <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </label>

            <div>
                {/* Render the selected number of DayComponents */}
                {Array.from({ length: selectedOption }, (_, index) => (
                    <DayComponent
                        key={index}
                        day={index + 1}
                        subject={subject}
                        grade={grade}
                        onSubmit={handleTutorSubmit}
                        ref={(ref) => (dayComponents[index] = ref)}
                    />
                ))}
            </div>

            <button onClick={handleSubmit}>Submit</button>

            <TutorComponent tutorResults={tutorResults} />
        </div>
    );
};

class DayComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDays: [],
            startTime: 0,
            endTime: 0,
            duration: 1,
        };
    }

    handleCheckboxChange = (dayOfWeek) => {
        this.setState((prevState) => {
            const { selectedDays } = prevState;
            if (selectedDays.includes(dayOfWeek)) {
                return { selectedDays: selectedDays.filter((selectedDay) => selectedDay !== dayOfWeek) };
            } else {
                return { selectedDays: [...selectedDays, dayOfWeek] };
            }
        });
    };

    handleStartTimeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        this.setState({ startTime: isNaN(value) ? 0 : value });
    };

    handleEndTimeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        this.setState({ endTime: isNaN(value) ? 0 : value });
    };

    handleDurationChange = (event) => {
        const value = parseInt(event.target.value, 10);
        this.setState({ duration: isNaN(value) ? 1 : value });
    };

    getData = () => {
        const { selectedDays, startTime, endTime, duration } = this.state;
        const slots = Array.from({ length: endTime - startTime }, (_, i) => startTime + i + 1);

        return {
            duration: duration,
            prefTime: selectedDays.map((dayOfWeek) => ({
                day: dayOfWeek,
                slots: slots,
            })),
        };
    };

    render() {
        const { day } = this.props;
        const { selectedDays, startTime, endTime, duration } = this.state;

        return (
            <div>
                <label>
                    Select days:
                    <div>
                        {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(
                            (dayOfWeek) => (
                                <label key={dayOfWeek}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDays.includes(dayOfWeek)}
                                        onChange={() => this.handleCheckboxChange(dayOfWeek)}
                                    />
                                    {dayOfWeek}
                                </label>
                            )
                        )}
                    </div>
                </label>

                <div>
                    <label>
                        Start Time:
                        <input type="number" value={startTime} onChange={this.handleStartTimeChange} />
                    </label>
                    <label>
                        End Time:
                        <input type="number" value={endTime} onChange={this.handleEndTimeChange} />
                    </label>
                    <label>
                        Duration:
                        <input type="number" value={duration} onChange={this.handleDurationChange} />
                    </label>
                </div>
            </div>
        );
    }
}

export default ConventionalComponent;
