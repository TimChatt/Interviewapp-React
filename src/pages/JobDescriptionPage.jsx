import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Card,
  CardBody,
  Textarea,
  useClipboard,
  useToast,
  Select,
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
  const toast = useToast();

  // Fetch job description
  useEffect(() => {
    const fetchJobDescription = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-description/${department}/${jobTitle}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job description.");
        }
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
        if (!response.ok) {
          throw new Error("Failed to fetch version history.");
        }
        const data = await response.json();
        setVersionHistory(data.history || []);
      } catch (err) {
        console.error("Error fetching history:", err.message);
      }
    };
    fetchVersionHistory();
  }, [department, jobTitle]);

  // Handle Save Job Description
  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/save-job-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department,
            job_title: jobTitle,
            description: editedDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job description.");
      }

      setJobDescription(editedDescription);
      setIsEditing(false);
      toast({
        title: "Job description updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error saving job description.",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Restore Previous Version
  const restoreVersion = async (selectedVersion) => {
    setEditedDescription(selectedVersion);
    toast({
      title: "Version restored!",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // AI-Powered Improvement
  const handleImproveDescription = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/improve-job-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: editedDescription }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate improved description.");
      }

      const data = await response.json();
      setEditedDescription(data.improved_description);
      toast({
        title: "AI-generated improvements applied!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error improving description.",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                size="lg"
                rows={10}
              />
            ) : (
              <Text fontSize="lg" whiteSpace="pre-wrap">
                {jobDescription}
              </Text>
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
                  <Button colorScheme="teal" onClick={handleImproveDescription}>
                    Improve with AI ✨
                  </Button>
                </>
              )}
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Version History */}
      {versionHistory.length > 0 && (
        <Box mt="6">
          <Heading size="md" mb="2">Version History</Heading>
          <Select
            placeholder="Select a previous version"
            onChange={(e) => restoreVersion(e.target.value)}
          >
            {versionHistory.map((version, index) => (
              <option key={index} value={version.description}>
                {version.date_changed} - {version.description.substring(0, 30)}...
              </option>
            ))}
          </Select>
        </Box>
      )}

      {!loading && !error && !jobDescription && (
        <Text textAlign="center" color="gray.600">
          No job description available for this role.
        </Text>
      )}
    </Box>
  );
};

export default JobDescriptionPage;
