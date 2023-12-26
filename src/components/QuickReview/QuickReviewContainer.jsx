import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components/macro'

import { toast } from 'components/shared'
import { API } from 'config/api'

const QuickReviewContainer = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courseTimetableList, setCourseTimetableList] = useState([])
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [review, setReview] = useState({})
  const [semesters, setSemesters] = useState({})

  const getSemesters = async () => {
    try {
      const response = await API.semesters.list()
      setSemesters(response[1])
    } catch (error) {
      toast({ status: 'error', content: error })
    }
  }

  const fetchUserTimetable = useCallback(async (season, year) => {
    try {
      setLoading(true)
      const response = await API.profile.timetable.read({
        season,
        year,
      })
      setCourseTimetableList(response)
    } catch (error) {
      toast({ status: 'error', content: error })
    } finally {
      setLoading(false)
    }
  }, [])

  const createContent = async ({ code, body }) => {
    try {
      const response = await API.reviews.create({
        payload: { course: code, parent: null, body },
      })
      console.log(response)
      toast({ status: 'success', content: 'Review awaiting approval.' })
    } catch (error) {
      toast({ status: 'error', content: error })
    }
  }

  useEffect(() => {
    getSemesters()
  }, [])

  useEffect(() => {
    if (semesters.season && semesters.year) {
      fetchUserTimetable(semesters.season, semesters.year)
    }
  }, [semesters])

  useEffect(() => {
    const courseList = courseTimetableList.map((item) => item.course)
    setCourses(courseList)
  }, [courseTimetableList])

  useEffect(() => {
    if (selectedCourse) {
      // Placeholder for fetching questions
      setQuestions([
        'How was your overall experience taking this course?',
        'How much was the course content and material relevant while preparing for exams?',
        'How much of conceptual clarity and understanding did you gain through this course?',
        'How was the evaluation and grading scheme?',
        'How well was the instructor able to communicate? Were the lectures interactive and intellectually stimulating? ',
        'How well did the course meet your expectations?',
        'How likely are you to recommend this course to others?',
      ])
    } else {
      setQuestions([])
    }
  }, [selectedCourse])

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value)
    setReview({}) // Reset review when course changes
  }

  const handleAnswerChange = (question, value) => {
    setReview((prev) => ({ ...prev, [question]: value }))
  }

  function convertJsonToHtmlString(jsonString) {
    const jsonData = JSON.parse(jsonString)
    let htmlString = ''

    Object.entries(jsonData).forEach(([question, rating]) => {
      htmlString += `<h3>${question} - ${rating}</h3><br>`
    })

    htmlString +=
      '1 - Very Unsatisfactory, 2 - Unsatisfactory, 3 - Neutral, 4 - Satisfactory, 5 - Excellent'

    return htmlString
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createContent({
      code: selectedCourse,
      body: convertJsonToHtmlString(JSON.stringify(review)),
    })
    // Post review to backend
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <DropdownContainer>
          <Label htmlFor="course-select">
            <Dropdown id="course-select" onChange={handleCourseChange}>
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </Dropdown>
          </Label>
        </DropdownContainer>
        {selectedCourse &&
          questions.map((question, index) => (
            <QuestionContainer key={question}>
              <Label htmlFor={`question-select-${index}`}>
                {question}
                <Dropdown
                  id={`question-select-${index}`}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Very Unsatisfactory</option>
                  <option value="2">2 - Unsatisfactory</option>
                  <option value="3">3 - Neutral</option>
                  <option value="4">4 - Satisfactory</option>
                  <option value="5">5 - Excellent</option>
                </Dropdown>
              </Label>
            </QuestionContainer>
          ))}
        {selectedCourse && <SubmitButton type="submit">Submit</SubmitButton>}
      </form>
    </Container>
  )
}

export default QuickReviewContainer

// Styled components
const Container = styled.div`
  background-color: ${({ theme }) => theme.darksecondary};
  border-radius: 8px;
  padding: 20px;
  color: white;
  width: 100%;
`

const DropdownContainer = styled.div`
  margin-bottom: 20px;
`

const QuestionContainer = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`

const Dropdown = styled.select`
  width: 100%;
  padding: 10px 15px;
  border-radius: 5px;
  margin: 10px 0;
  color: white;
  background-color: ${({ theme }) => theme.secondary};
`

const SubmitButton = styled.button`
  background-color: #707aff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
`