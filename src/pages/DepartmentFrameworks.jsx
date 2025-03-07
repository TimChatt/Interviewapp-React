import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Text,
  VStack,
  SimpleGrid
} from "@chakra-ui/react";
import JobTitleDetailsModal from "./JobTitleDetailsModal";

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Modal state for job details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedJobLevel, setSelectedJobLevel] = useState(null);

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${encodeURIComponent(department)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job titles.");
        }
        const data = await response.json();
        setJobTitles(data.job_titles || []);
      } catch (err) {
        setError("Failed to fetch job titles for this department.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentJobTitles();
  }, [department]);

  // Utility: Extract job level from job title string (e.g., "L1" from "Software Engineer - Computer Vision L1")
  const extractJobLevel = (jobTitleStr) => {
    const match = jobTitleStr.match(/L\d+/);
    return match ? match[0] : "L1";
  };

  // Open the modal and pass job details
  const openModal = (job) => {
    setSelectedJobTitle(job.job_title);
    setSelectedJobLevel(extractJobLevel(job.job_title));
    setIsModalOpen(true);
  };

  // Navigate to Job Description Builder
  const handleViewJobDescription = (job) => {
    navigate(`/job-description/${department}/${job.job_title}`);
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        {department} Frameworks
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

      {!loading && !error && jobTitles.length === 0 && (
        <Box textAlign="center" color="gray.600" mt="4">
          <Text>No job titles found for this department.</Text>
        </Box>
      )}

      {!loading && !error && jobTitles.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {jobTitles.map((job, index) => (
            <Card key={index} p={4} shadow="md" borderRadius="lg">
              <CardBody textAlign="center">
                <Heading size="md" mb="2">{job.job_title}</Heading>
                <Text mb="2">Level: {extractJobLevel(job.job_title)}</Text>
                <Button
                  colorScheme="blue"
                  size="sm"
                  mr="2"
                  onClick={() => openModal(job)}
                >
                  View Details
                </Button>
                <Button
                  colorScheme="purple"
                  size="sm"
                  onClick={() => handleViewJobDescription(job)}
                >
                  View Job Description
                </Button>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {isModalOpen && (
        <JobTitleDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          department={department}
          jobTitle={selectedJobTitle}
          jobLevel={selectedJobLevel}
        />
      )}
    </Box>
  );
};

export default DepartmentFrameworks;
