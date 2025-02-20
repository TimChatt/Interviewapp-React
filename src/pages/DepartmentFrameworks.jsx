import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Heading, Grid, GridItem, Button, Spinner, Alert, AlertIcon, Card, CardBody, Text, VStack, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@chakra-ui/react";

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }
        const data = await response.json();
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

  const openModal = (jobTitle) => {
    const levels = ["L1", "L2", "L3", "L4"];
    const jobLevel = levels.find(level => jobTitle.includes(level)) || "L1";
    setSelectedDetails({ department, jobTitle, jobLevel });
    onOpen();
  };

  const handleEdit = (jobTitle) => {
    navigate(`/edit-framework/${jobTitle}`);
  };

  return (
    <Box maxW="1000px" mx="auto" py="6">
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
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {jobTitles.map((job, index) => (
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
      )}

      {/* Modal with job details */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Job Title Details</ModalHeader>
          <ModalBody>
            {selectedDetails && (
              <Box>
                <Text><strong>Department:</strong> {selectedDetails.department}</Text>
                <Text><strong>Job Title:</strong> {selectedDetails.jobTitle}</Text>
                <Text><strong>Job Level:</strong> {selectedDetails.jobLevel}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DepartmentFrameworks;
