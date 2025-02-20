import React, { useState } from "react";
import { Box, Heading, Select, Text, Card, CardBody, VStack } from "@chakra-ui/react";
import trainingData from "../mockdata/InterviewerTrainingMock.json";

const InterviewerPlaybook = () => {
  const [selectedJob, setSelectedJob] = useState("Frontend Engineer");

  // Find the data for the selected job
  const playbook = trainingData.find((job) => job.jobTitle === selectedJob);

  return (
    <Box maxW="800px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Interviewer Playbook
      </Heading>

      {/* Job Selector */}
      <Box mb="6">
        <Text fontSize="lg" fontWeight="bold" mb="2">Select Job Title:</Text>
        <Select 
          value={selectedJob} 
          onChange={(e) => setSelectedJob(e.target.value)}
          bg="white" 
          shadow="md"
        >
          {trainingData.map((job) => (
            <option key={job.jobTitle} value={job.jobTitle}>
              {job.jobTitle}
            </option>
          ))}
        </Select>
      </Box>

      {/* Playbook Content */}
      {playbook ? (
        <VStack spacing={5}>
          {playbook.questions.map((q, idx) => (
            <Card key={idx} w="100%" bg="white" shadow="md" borderRadius="lg" transition="all 0.2s ease" 
              _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}>
              <CardBody>
                <Heading size="md" color="purple.700" mb="3">{q.category}</Heading>
                <Text><strong>Question:</strong> {q.question}</Text>
                <Text color="gray.600"><strong>Expected Answer:</strong> {q.expectedAnswer}</Text>
                <Text color="gray.500"><strong>Follow-up:</strong> {q.followUp}</Text>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
        <Text textAlign="center" fontSize="lg" color="gray.500">No playbook available for this job title.</Text>
      )}
    </Box>
  );
};

export default InterviewerPlaybook;
