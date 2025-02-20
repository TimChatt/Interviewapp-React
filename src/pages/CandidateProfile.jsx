import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Button, Grid, GridItem, VStack, Card, CardBody, Tag, Flex, Divider, Tooltip
} from "@chakra-ui/react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";
import interviewerTrainingMock from "../mockdata/interviewerTrainingMock.json";

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

  // Merge Ashby & Metaview data
  const candidate = ashbyMockData.find((_, index) => index + 1 === parseInt(candidateId));
  const transcript = metaviewMockData.find(meta => meta.candidateName === candidate?.candidateName)?.transcript || [];

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

      {/* AI Insights & Feedback */}
      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="md" mb="4">AI Review & Feedback</Heading>
          <Text fontSize="md" color="gray.600" mb="2">{candidate.aiAdvice.general}</Text>
          <Heading size="sm" mt="3">Strengths</Heading>
          {candidate.aiAdvice.didWell.map((item, index) => (
            <Text key={index}><strong>{item.point}</strong> ({item.citation})</Text>
          ))}
          <Heading size="sm" mt="3">Areas for Improvement</Heading>
          {candidate.aiAdvice.couldImprove.map((item, index) => (
            <Text key={index}><strong>{item.point}</strong> ({item.citation})</Text>
          ))}
        </CardBody>
      </Card>

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

      {/* Radar Chart */}
      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="md" mb="4">Competency Radar</Heading>
          {radarData.length > 0 ? (
            <RadarChart outerRadius={90} width={400} height={300} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Candidate" dataKey="candidateScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          ) : <Text>No radar data available.</Text>}
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

export default CandidateProfile;
