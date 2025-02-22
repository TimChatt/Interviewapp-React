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
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [answerAnalysis, setAnswerAnalysis] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [competenciesMap, setCompetenciesMap] = useState({});
  const [showGeneratedQuestions, setShowGeneratedQuestions] = useState(false);

  // Fetch all job titles & their competencies
  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-interview-job-titles?department=Engineering`
        );
        if (!response.ok) throw new Error("Failed to fetch job titles.");
        const data = await response.json();

        setJobTitles(data.job_titles.map((job) => job.job_title) || []);

        // Store competencies mapped to job titles
        const jobCompetencies = {};
        data.job_titles.forEach((job) => {
          jobCompetencies[job.job_title] = job.competencies || [];
        });
        setCompetenciesMap(jobCompetencies);
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

  // Fetch saved interview questions when a job title is selected
  useEffect(() => {
    if (!selectedJobTitle) return;
  
    const fetchSavedQuestions = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-interview-questions/${selectedJobTitle}`
        );
        if (!response.ok) throw new Error("Failed to fetch saved questions.");
        const data = await response.json();
  
        console.log("✅ Loaded Saved Questions:", data.questions);  // Debugging
  
        setSavedQuestions(data.questions || []);
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
    if (!selectedJobTitle) {
      toast({
        title: "Select a job title first",
        description: "You need to select a job title before generating questions.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    // ✅ Convert competencies from object list to string list
    const formattedCompetencies = (competenciesMap[selectedJobTitle] || []).map(comp => comp.name);
  
    const requestBody = {
      job_title: selectedJobTitle,
      department: "Engineering",
      competencies: formattedCompetencies, // ✅ Ensure it's a list of strings
    };
  
    console.log("🔍 Sending request payload:", JSON.stringify(requestBody)); // ✅ Debugging
  
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/generate-interview-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!response.ok) throw new Error("Failed to generate questions.");
      const data = await response.json();
  
      console.log("✅ Response:", data);
      setQuestions(data.questions);
      setShowGeneratedQuestions(true);
    } catch (err) {
      console.error("❌ Error:", err);
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



  // Set selected question when clicked
  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions to Save",
        description: "Please generate questions first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/save-interview-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: selectedJobTitle,
            questions: questions.map((q) => ({
              question: q.question,
              follow_up: q.follow_up || "",
              competency: q.competency || "General Skills",
              competencies_covered: [q.competency || "General Skills"],  // ✅ Ensure this is included
            })),
          }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to save questions.");
      const data = await response.json();
      toast({
        title: "Questions Saved!",
        description: `${data.message}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      // Refresh saved questions
      fetchSavedQuestions();
    } catch (err) {
      toast({
        title: "Error Saving Questions",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
            question: selectedQuestion.question,
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
      
      {/* ✅ Display Saved Interview Questions */}
      {savedQuestions.length > 0 && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
          <CardBody>
            <Heading size="md" mb="4">Saved Interview Questions</Heading>
            <VStack align="stretch">
              {savedQuestions.map((q, index) => (
                <Box
                  key={index}
                  p="4"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => setSelectedQuestion(q)} // ✅ Set selected question when clicked
                >
                  <Text fontWeight="bold">{q.question}</Text>
                  <Text color="gray.600">Follow-Up: {q.follow_up}</Text>
                  <Text fontSize="sm" color="blue.500">
                    Competencies Covered: {q.competencies_covered?.join(", ") || "General Skills"}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* ✅ Generate AI-Powered Questions */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4">
        <CardBody>
          <Heading size="md" mb="4">Generate AI-Powered Questions</Heading>
          
          <Button 
            colorScheme="blue" 
            onClick={handleGenerateQuestions} 
            isLoading={loading}
          >
            Generate Questions 🤖
          </Button>
        </CardBody>
      </Card>
      
      {/* ✅ Display AI-Generated Interview Questions */}
      {questions.length > 0 && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4">
          <CardBody>
            <Heading size="md" mb="4">Generated AI-Powered Questions</Heading>
            <VStack align="stretch">
              {questions.map((q, index) => (
                <Box
                  key={index}
                  p="4"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => setSelectedQuestion(q)} // ✅ Set selected question when clicked
                >
                  <Text fontWeight="bold">{q.question}</Text>
                  <Text color="gray.600">Follow-Up: {q.follow_up}</Text>
                  <Text fontSize="sm" color="blue.500">
                    Competencies Covered: {q.competency || "General Skills"}
                  </Text>
                </Box>
              ))}
            </VStack>
            {/* ✅ Save Questions Button */}
            <Button colorScheme="green" mt="4" onClick={handleSaveQuestions}>
              Save Questions 💾
             </Button>
          </CardBody>
        </Card>
      )}


      {/* ✅ Assess Candidate Answers */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mt="6">
        <CardBody>
          <Heading size="md" mb="4">Assess Candidate Answers</Heading>
      
          {/* ✅ Display Selected Question */}
          {selectedQuestion ? (
            <Box mt="4" p="4" border="1px solid #E2E8F0" borderRadius="md" bg="gray.50">
              <Text fontWeight="bold">Selected Question: {selectedQuestion.question}</Text>
              <Text color="gray.600">Follow-Up: {selectedQuestion.follow_up}</Text>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              Click a question to assess.
            </Alert>
          )}
      
          {/* ✅ Candidate Response Input */}
          <Textarea
            placeholder="Enter candidate's answer..."
            value={candidateResponse}
            onChange={(e) => setCandidateResponse(e.target.value)}
            mt="4"
          />
      
          {/* ✅ Assess Answer Button */}
          <Button colorScheme="teal" mt="4" onClick={handleAssessAnswer} isLoading={loading}>
            Assess Answer 📊
          </Button>
      
          {/* ✅ Display Answer Analysis */}
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
