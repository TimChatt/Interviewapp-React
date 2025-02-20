import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Heading, Grid, GridItem, Button, Spinner, Alert, AlertIcon, Card, CardBody, Text, VStack, useDisclosure
} from "@chakra-ui/react";
import JobTitleDetailsModal from "./JobTitleDetailsModal"; // ✅ Ensure correct import

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure(); // ✅ Chakra modal control
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Job Titles:", data.job_titles); // ✅ Debug log
        setJobTitles(data.job_titles || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch job titles for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentJobTitles();
  }, [department]);

  // ✅ Ensure correct jobTitle and jobLevel are passed before opening modal
  const openModal = (jobTitle) => {
    const levels = ["L1", "L2", "L3", "L4"];
    const jobLevel = levels.find(level => jobTitle.includes(level)) || "L1";

    const details = { department, jobTitle, jobLevel };
    console.log("Opening Modal with Details:", details); // ✅ Debugging log

    setSelectedDetails(details);

    // ✅ Ensure modal opens after state update
    setTimeout(() => {
      onOpen();
      console.log("Modal isOpen state:", isOpen);
    }, 100);
  };

  // ✅ Group job titles by category (e.g., "Machine Learning", "Data Science")
  const groupedTitles = jobTitles.reduce((acc, job) => {
    const category = job.job_title.replace(/L\d+/, "").trim(); // Extracts category
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
                      </CardBody>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}

      {/* ✅ Ensure modal correctly receives props and opens */}
      {selectedDetails && (
        <JobTitleDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          department={selectedDetails.department}
          jobTitle={selectedDetails.jobTitle}
          jobLevel={selectedDetails.jobLevel}
        />
      )}
    </Box>
  );
};

export default DepartmentFrameworks;
