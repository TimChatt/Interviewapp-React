import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Button, Tag, Flex, Divider, Tooltip, Tabs, TabList, TabPanels, Tab, TabPanel, Progress, VStack, Card, CardBody, Badge
} from "@chakra-ui/react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";
import InterviewerTrainingMock from "../mockdata/InterviewerTrainingMock.json";

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
  const [selectedTab, setSelectedTab] = useState(0);

  const candidate = ashbyMockData[parseInt(candidateId) - 1]; // Use index-based lookup
  const transcriptData = metaviewMockData.find(meta => meta.candidateName === candidate?.candidateName);
  const transcript = transcriptData?.transcript || [];
  const interviewTraining = interviewerTrainingMock.find(job => job.jobTitle === candidate?.jobTitle)?.questions || [];

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

  const radarData = candidate?.scores ? Object.entries(candidate.scores).map(([skill, score]) => ({
    skill,
    candidateScore: score
  })) : [];

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Button colorScheme="purple" mb="6" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </Button>

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
          <Text fontSize="lg" color="gray.600"><strong>Speaking Ratio:</strong> Candidate {candidateRatio}% / Interviewer {interviewerRatio}%</Text>
        </CardBody>
      </Card>

      <Tabs variant="enclosed" index={selectedTab} onChange={setSelectedTab}>
        <TabList>
          <Tab>AI Summary</Tab>
          <Tab>Scorecard</Tab>
          <Tab>Competency Radar</Tab>
          <Tab>Interview Transcript</Tab>
          <Tab>Interview Training</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card p="6" bg="white" shadow="md">
              <CardBody>
                <Heading size="md" mb="4">AI-Generated Summary</Heading>
                <Text fontSize="md" color="gray.600">{candidate?.aiAdvice?.general || "No AI summary available."}</Text>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card p="6" bg="white" shadow="md">
              <CardBody>
                <Heading size="md" mb="4">Scorecard</Heading>
                {candidate?.scores ? (
                  Object.entries(candidate.scores).map(([skill, score]) => (
                    <Box key={skill} mb="3">
                      <Text><strong>{skill}:</strong> {score}/5</Text>
                      <Progress value={(score / 5) * 100} size="sm" colorScheme="purple" mt="1" />
                    </Box>
                  ))
                ) : <Text>No score data available.</Text>}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card p="6" bg="white" shadow="md">
              <CardBody>
                <Heading size="md" mb="4">Competency Radar</Heading>
                {radarData.length > 0 ? (
                  <RadarChart outerRadius={90} width={400} height={300} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar name="Candidate" dataKey="candidateScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                ) : <Text>No competency data available.</Text>}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card p="6" bg="white" shadow="md">
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CandidateProfile;

