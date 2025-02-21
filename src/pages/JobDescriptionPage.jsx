import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Box,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Card,
  CardBody,
  useClipboard,
  useToast,
  Select,
  Text,
} from "@chakra-ui/react";

const JobDescriptionPage = () => {
  const { department, jobTitle } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { onCopy, hasCopied } = useClipboard(jobDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [versionHistory, setVersionHistory] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const toast = useToast();

  // Fetch job description
  useEffect(() => {
    const fetchJobDescription = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-description/${department}/${jobTitle}`
        );
        if (!response.ok) throw new Error("Failed to fetch job description.");
        const data = await response.json();
        setJobDescription(data.job_description);
        setEditedDescription(data.job_description);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDescription();
  }, [department, jobTitle]);

  // Fetch version history
  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-description-history/${department}/${jobTitle}`
        );
        if (!response.ok) throw new Error("Failed to fetch version history.");
        const data = await response.json();
        setVersionHistory(data.history || []);
      } catch (err) {
        console.error("Error fetching history:", err.message);
      }
    };
    fetchVersionHistory();
  }, [department, jobTitle]);

  // Save Job Description
  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/save-job-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department,
            job_title: jobTitle,
            description: editedDescription,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save job description.");
      setJobDescription(editedDescription);
      setIsEditing(false);
      toast({ title: "Job description updated.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error saving job description.", description: err.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  // Restore Previous Version
  const restoreVersion = async (selectedVersion) => {
    setEditedDescription(selectedVersion);
    toast({ title: "Version restored!", status: "info", duration: 2000, isClosable: true });
  };

  // AI-Powered Improvement
  const handleImproveDescription = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/improve-job-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: editedDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate improved description.");
      const data = await response.json();
      setEditedDescription(data.improved_description);
      toast({ title: "AI-generated improvements applied!", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error improving description.", description: err.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  // AI-Powered Analysis
  const handleAnalyzeDescription = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/analyze-job-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: editedDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze job description.");
      const data = await response.json();
      setAnalysis(data.analysis);
      toast({ title: "Analysis completed!", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error analyzing description.", description: err.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <Box maxW="800px" mx="auto" py="6">
      <Button onClick={() => navigate(-1)} colorScheme="gray" mb="4">
        ← Back
      </Button>

      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        {jobTitle} - Job Description
      </Heading>

      {loading && (
        <VStack justify="center" align="center">
          <Spinner size="xl" color="purple.500" />
        </VStack>
      )}

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Card bg="white" shadow="md" borderRadius="lg">
          <CardBody>
            {isEditing ? (
              <ReactQuill theme="snow" value={editedDescription} onChange={setEditedDescription} />
            ) : (
              <Box border="1px solid #E2E8F0" p="4" borderRadius="md" minH="200px">
                <Text fontSize="lg" whiteSpace="pre-wrap" dangerouslySetInnerHTML={{ __html: jobDescription }} />
              </Box>
            )}

            <Box mt="4">
              {isEditing ? (
                <>
                  <Button colorScheme="green" mr="2" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button colorScheme="gray" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button colorScheme="blue" mr="2" onClick={onCopy}>
                    {hasCopied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                  <Button colorScheme="purple" mr="2" onClick={() => setIsEditing(true)}>
                    Edit Job Description
                  </Button>
                  <Button colorScheme="teal" mr="2" onClick={handleImproveDescription}>
                    Improve with AI ✨
                  </Button>
                  <Button colorScheme="orange" onClick={handleAnalyzeDescription}>
                    Analyze for Bias 📊
                  </Button>
                </>
              )}
            </Box>
          </CardBody>
        </Card>
      )}

      {analysis && (
        <Box mt="6" p="4" border="1px solid #E2E8F0" borderRadius="md" bg="gray.100">
          <Heading size="md" mb="2">AI Analysis</Heading>
          <Text>{analysis}</Text>
        </Box>
      )}
    </Box>
  );
};

export default JobDescriptionPage;
