import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Button, Grid, GridItem, VStack, Card, CardBody, Tag, Flex, Divider
} from "@chakra-ui/react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip
} from "recharts";

import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";

// Debugging logs
console.log("Ashby Mock Data:", ashbyMockData);
console.log("Metaview Mock Data:", metaviewMockData);

// Helper function to get speaking ratio
function getSpeakingRatio(transcriptEntries) {
  let candidateWords = 0;
  let interviewerWords = 0;
  transcriptEntries.forEach((entry) => {
    candidateWords += (entry.candidateAnswer || "").split(/\s+/).length;
    interviewerWords += (entry.question || "").split(/\s+/).length;
  });
  return { candidateWords, interviewerWords };
}

const CandidateProfile = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Find the candidate in Ashby mock data
  const candidate = ashbyMockData.find((item) => item.id === parseInt(candidateId));
  console.log("Selected Candidate:", candidate);

  // Find corresponding interview transcript from Metaview mock data
  const transcriptData = metaviewMockData.find(meta => meta.candidateName === candidate?.candidateName);
  console.log("Transcript Data:", transcriptData);

  const transcript = transcriptData ? transcriptData.transcript : [];

  if (!candidate) {
    return (
      <Flex height="100vh" justify="center" align="center" direction="column">
        <Heading size="lg">Candidate not found</Heading>
        <Button mt="4" colorScheme="purple" onClick={() => navigate("/candidates")}>
          Go Back
        </Button>
      </Flex>
    );
  }

  const { candidateWords, interviewerWords } = getSpeakingRatio(transcript);
  const totalWords = candidateWords + interviewerWords || 1;
  const candidateRatio = ((candidateWords / totalWords) * 100).toFixed(1);
  const interviewerRatio = ((interviewerWords / totalWords) * 100).toFixed(1);

  // Radar Chart Data
  const radarData = Object.entries(candidate.scores || {}).map(([skill, score]) => ({
    skill,
    candidateScore: score
  }));

  return (
    <Box maxW="1000px" mx="auto" py="6">
      {/* Back Button */}
      <Button colorScheme="purple" mb="6" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </Button>

      {/* Candidate Details */}
      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="xl" mb="2">{candidate.candidateName}</Heading>
          <Text fontSize="lg" color="gray.600"><strong>Job Title:</strong> {candidate.jobTitle}</Text>
          <Text fontSize="lg" color="gray.600"><strong>Interview Date:</strong> {candidate.interviewDate}</Text>
          <Text fontSize="lg" color="gray.600">
            <strong>Status:</strong> 
            <Tag colorScheme={candidate.status === "Hired" ? "green" : "red"} ml="2">
              {candidate.status}
            </Tag>
          </Text>
        </CardBody>
      </Card>

      {/* Grid Layout for Sections */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb="6">
        {/* Interview Timeline */}
        <GridItem>
          <StatCard title="Interview Timeline" content={
            candidate.timeline?.length > 0 ? (
              candidate.timeline.map((t, idx) => (
                <Text key={idx}><strong>{t.stage}</strong> - {t.date}</Text>
              ))
            ) : <Text>No timeline data available.</Text>
          } />
        </GridItem>

        {/* Speaking Ratio */}
        <GridItem>
          <StatCard title="Speaking Ratio" content={
            <>
              <Text><strong>Candidate:</strong> {candidateRatio}%</Text>
              <Text><strong>Interviewer:</strong> {interviewerRatio}%</Text>
            </>
          } />
        </GridItem>
      </Grid>

      {/* Scorecard */}
      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="md" mb="4">Scorecard</Heading>
          {candidate.scores ? (
            <VStack align="start">
              {Object.entries(candidate.scores).map(([skill, score]) => (
                <Text key={skill}><strong>{skill}:</strong> {score}</Text>
              ))}
            </VStack>
          ) : <Text>No scores available.</Text>}
        </CardBody>
      </Card>

      {/* Interview Transcript */}
      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="md" mb="4">Interview Transcript</Heading>
          {transcript.length > 0 ? (
            transcript.map((entry, idx) => (
              <Box key={idx} mb="4">
                <Text><strong>Q:</strong> {entry.question}</Text>
                <Text><em>A: {entry.candidateAnswer}</em></Text>
                <Divider my="2" />
              </Box>
            ))
          ) : <Text>No transcript available.</Text>}
        </CardBody>
      </Card>
    </Box>
  );
};

// Reusable StatCard Component
const StatCard = ({ title, content }) => {
  return (
    <Card bg="white" shadow="md" borderRadius="lg">
      <CardBody>
        <Heading size="md" mb="2">{title}</Heading>
        {content}
      </CardBody>
    </Card>
  );
};

export default CandidateProfile;
