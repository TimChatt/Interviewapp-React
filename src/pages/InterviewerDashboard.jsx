import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";

const InterviewerDashboard = () => {
  const toast = useToast();

  // States
  const [jobTitles, setJobTitles] = useState([]); // Fetch all job titles
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [answerAnalysis, setAnswerAnalysis] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showGeneratedQuestions, setShowGeneratedQuestions] = useState(false); // Toggle AI-generated vs saved

  // Fetch all job titles
  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-interview-job-titles?department=Engineering`
        );
        if (!response.ok) throw new Error("Failed to fetch job titles.");
        const data = await response.json();
        setJobTitles(data.job_titles.map((job) => job.job_title) || []);
      } catch (err) {
        toast({
          title: "Error fetching job titles",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchJobTitles();
  }, [toast]);

  // Fetch saved interview questions for this job title
  useEffect(() => {
    if (!selectedJobTitle) return;

    const fetchSavedQuestions = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-interview-questions/${selectedJobTitle}`
        );
        if (!response.ok) throw new Error("Failed to fetch saved questions.");
        const data = await response.json();
        setSavedQuestions(data.questions);
      } catch (err) {
        toast({
          title: "Error fetching saved questions",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchSavedQuestions();
  }, [selectedJobTitle, toast]);

  // Generate AI-powered questions
  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/generate-interview-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: selectedJobTitle,
            department: "Engineering",  // Replace with a dynamic value if needed
            competencies: [],  // Pass actual competencies if available
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate questions.");
      const data = await response.json();
      setQuestions(data.questions);
      setShowGeneratedQuestions(true); // Show AI-generated questions
    } catch (err) {
      toast({
        title: "Error generating questions",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Assess candidate's response
  const handleAssessAnswer = async () => {
    if (!selectedQuestion || !candidateResponse.trim()) {
      toast({
        title: "Incomplete Data",
        description: "Select a question and provide a candidate response.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/assess-candidate-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: selectedQuestion,
            candidate_answer: candidateResponse,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assess answer.");
      const data = await response.json();
      setAnswerAnalysis(data);
    } catch (err) {
      toast({
        title: "Error assessing answer",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="900px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Interviewer Dashboard
      </Heading>

      {/* Job Title Dropdown */}
      <Select
        placeholder="Select a Job Title"
        onChange={(e) => setSelectedJobTitle(e.target.value)}
        value={selectedJobTitle}
        mb="4"
      >
        {jobTitles.map((title, index) => (
          <option key={index} value={title}>{title}</option>
        ))}
      </Select>

      {/* Generate AI-Powered Questions */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4">
        <CardBody>
          <Heading size="md" mb="4">Generate AI-Powered Questions</Heading>
          <Button colorScheme="blue" onClick={handleGenerateQuestions} isLoading={loading}>
            Generate Questions 🤖
          </Button>

          {questions.length > 0 && (
            <VStack align="stretch" mt="4">
              {questions.map((q, index) => (
                <Box key={index} p="4" border="1px solid #E2E8F0" borderRadius="md">
                  <Text fontWeight="bold">{q}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Toggle Saved or AI Questions */}
      <Button
        mt="4"
        onClick={() => setShowGeneratedQuestions(!showGeneratedQuestions)}
      >
        {showGeneratedQuestions ? "Show Saved Questions" : "Show AI-Generated Questions"}
      </Button>

      {/* Saved Questions */}
      {!showGeneratedQuestions && savedQuestions.length > 0 && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4" mt="6">
          <CardBody>
            <Heading size="md" mb="4">Saved Questions</Heading>
            <VStack align="stretch">
              {savedQuestions.map((q) => (
                <Box
                  key={q.id}
                  p="4"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => setSelectedQuestion(q.question)}
                >
                  <Text fontWeight="bold">{q.question}</Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Candidate Answer Assessment */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mt="6">
        <CardBody>
          <Heading size="md" mb="4">Assess Candidate Answers</Heading>
          <Textarea
            placeholder="Enter candidate's answer..."
            value={candidateResponse}
            onChange={(e) => setCandidateResponse(e.target.value)}
            mt="4"
          />
          <Button colorScheme="teal" mt="4" onClick={handleAssessAnswer} isLoading={loading}>
            Assess Answer 📊
          </Button>

          {answerAnalysis && (
            <Box mt="4" p="4" border="1px solid #E2E8F0" borderRadius="md" bg="gray.50">
              <Text fontWeight="bold">Score: {answerAnalysis.score} / 4</Text>
              <Text color="gray.600">{answerAnalysis.explanation}</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default InterviewerDashboard;
