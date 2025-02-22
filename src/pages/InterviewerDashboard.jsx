import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Textarea,
  useToast,
} from "@chakra-ui/react";

const InterviewerDashboard = () => {
  const { jobTitle } = useParams();
  const toast = useToast();

  // States
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [answerAnalysis, setAnswerAnalysis] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch saved interview questions for this job title
  useEffect(() => {
    const fetchSavedQuestions = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-interview-questions/${jobTitle}`
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
  }, [jobTitle, toast]);

  // Generate AI-powered questions
  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/generate-interview-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_title: jobTitle, department: "Unknown", competencies: [] }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate questions.");
      const data = await response.json();
      setQuestions(data.questions);
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
        Interviewer Dashboard - {jobTitle}
      </Heading>

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
                  <Text fontWeight="bold">{q.question}</Text>
                  <Text color="gray.600">Follow-Up: {q.follow_up}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Saved Questions */}
      {savedQuestions.length > 0 && (
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
                  {q.follow_up && <Text color="gray.600">Follow-Up: {q.follow_up}</Text>}
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
          {selectedQuestion ? (
            <Text fontWeight="bold">Selected Question: {selectedQuestion}</Text>
          ) : (
            <Alert status="info" mt="2">
              <AlertIcon />
              Select a question from the list above.
            </Alert>
          )}

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
