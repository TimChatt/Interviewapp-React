import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Heading, Grid, GridItem, Button, Spinner, Alert, AlertIcon, Card, CardBody, Text, VStack
} from "@chakra-ui/react";
import JobTitleDetailsModal from "./JobTitleDetailsModal"; // ✅ Import the modal component

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Modal State for Job Details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedJobLevel, setSelectedJobLevel] = useState(null);

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
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

  // ✅ Extracts job category (e.g., "Machine Learning" from "Machine Learning L1")
  const extractJobCategory = (jobTitle) => jobTitle.replace(/L\d+/, "").trim();

  // ✅ Extracts the job level (e.g., "L1" from "Machine Learning L1")
  const extractJobLevel = (jobTitle) => {
    const match = jobTitle.match(/L\d+/);
    return match ? match[0] : "L1";
  };

  // ✅ Open the modal and pass job details
  const openModal = (jobTitle) => {
    setSelectedJobTitle(jobTitle);
    setSelectedJobLevel(extractJobLevel(jobTitle));
    setIsModalOpen(true);
  };

  const handleEdit = (jobTitle) => {
    navigate(`/edit-framework/${jobTitle}`);
  };

  // ✅ Groups job titles by category
  const groupedTitles = jobTitles.reduce((acc, job) => {
    const category = extractJobCategory(job.job_title);
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {});

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
        <>
          {Object.entries(groupedTitles).map(([category, jobs], idx) => (
            <Box key={idx} mb="8">
              <Heading size="lg" color="purple.700" mb="4">{category}</Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                {jobs.map((job, index) => (
                  <GridItem key={index}>
                    <Card bg="white" shadow="md" borderRadius="lg">
                      <CardBody textAlign="center">
                        <Heading size="md" mb="2">{job.job_title}</Heading>
                        <Button colorScheme="blue" size="sm" mr="2" onClick={() => openModal(job.job_title)}>
                          View Details
                        </Button>
                        <Button colorScheme="purple" size="sm" onClick={() => handleEdit(job.job_title)}>
                          Edit Framework
                        </Button>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}

      {/* ✅ Use JobTitleDetailsModal Instead of Manual Modal */}
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
