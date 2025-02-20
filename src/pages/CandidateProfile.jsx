import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Button, Grid, GridItem, VStack, Card, CardBody, Tag, Flex, Divider, Stat, StatLabel, StatNumber
} from "@chakra-ui/react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";

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
  const candidate = ashbyMockData.find((item, index) => index + 1 === parseInt(candidateId));
  const transcript = metaviewMockData.find(meta => meta.candidateName === candidate?.candidateName)?.transcript || [];
  const feedback = metaviewMockData.find(meta => meta.candidateName === candidate?.candidateName)?.aiFeedback || "No AI feedback available.";

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

      {/* AI Insights & Interview Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb="6">
        {/* AI Feedback */}
        <GridItem>
          <StatCard title="AI Feedback" content={<Text>{feedback}</Text>} />
        </GridItem>

        {/* Speaking Ratio */}
        <GridItem>
          <StatCard title="Speaking Ratio" content={
            <>
              <PieChart width={200} height={200}>
                <Pie dataKey="value" data={[{ name: "Candidate", value: candidateWords }, { name: "Interviewer", value: interviewerWords }]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  <Cell key="candidate" fill="#82ca9d" />
                  <Cell key="interviewer" fill="#ffc658" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
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
