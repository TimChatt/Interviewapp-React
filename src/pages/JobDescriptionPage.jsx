import React, { useState, useEffect } from "react";
import {
  Box, Heading, Textarea, Button, VStack, Spinner, Alert, AlertIcon, useToast
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const JobDescriptionPage = () => {
  const { department, jobTitle } = useParams();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchJobDescription = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-description/${department}/${jobTitle}`
        );
        if (!response.ok) {
          throw new Error("No job description found.");
        }
        const data = await response.json();
        setJobDescription(data.job_description);
      } catch (err) {
        setError("No job description available. You can generate one.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDescription();
  }, [department, jobTitle]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/generate-job-description",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_title: jobTitle, department }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate job description.");
      }

      const data = await response.json();
      setJobDescription(data.job_description);
      toast({
        title: "Generated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error generating job description.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/save-job-description",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: jobTitle,
            department,
            description: jobDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job description.");
      }

      toast({
        title: "Saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error saving job description.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" py="6">
      <Heading size="xl" color="purple.600" mb="4" textAlign="center">
        Job Description - {jobTitle}
      </Heading>

      {loading && (
        <VStack>
          <Spinner size="xl" color="purple.500" />
        </VStack>
      )}

      {error && (
        <Alert status="warning" mb="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Textarea
        placeholder="Enter job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        size="lg"
        minH="200px"
        mt="4"
      />

      <VStack mt="6">
        <Button
          colorScheme="blue"
          isLoading={isGenerating}
          onClick={handleGenerateDescription}
        >
          Generate AI-Powered Description
        </Button>

        <Button
          colorScheme="green"
          isLoading={isSaving}
          onClick={handleSaveDescription}
        >
          Save Job Description
        </Button>
      </VStack>
    </Box>
  );
};

export default JobDescriptionPage;
