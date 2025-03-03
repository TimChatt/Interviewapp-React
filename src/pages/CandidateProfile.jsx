import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Button, Tag, Flex, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, Progress, VStack, Card, CardBody, Badge, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const BACKEND_URL = "https://interviewappbe-production.up.railway.app"; // ✅ Backend URL

const CandidateProfile = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [scorecard, setScorecard] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** ✅ Fetch Candidate Profile */
  const fetchCandidate = useCallback(async () => {
    try {
      console.log(`🔍 Fetching candidate profile for ID: ${candidateId}`);
      const response = await fetch(`${BACKEND_URL}/candidate/${candidateId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Candidate Profile:", data);
      setCandidate(data);
    } catch (err) {
      console.error("❌ Error fetching candidate profile:", err);
      setError(err.message);
    }
  }, [candidateId]);

  /** ✅ Fetch Candidate Scorecard */
  const fetchScorecard = useCallback(async () => {
    try {
      console.log(`🔍 Fetching scorecard for Candidate ID: ${candidateId}`);
      const response = await fetch(`${BACKEND_URL}/candidate/${candidateId}/scorecard`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Scorecard Data:", data);
      setScorecard(data);
    } catch (err) {
      console.error("❌ Error fetching scorecard:", err);
    }
  }, [candidateId]);

  /** ✅ Fetch Interview Transcript */
  const fetchTranscript = useCallback(async () => {
    try {
      console.log(`🔍 Fetching interview transcript for Candidate ID: ${candidateId}`);
      const response = await fetch(`${BACKEND_URL}/candidate/${candidateId}/interview-transcript`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Transcript Data:", data);
      setTranscript(data);
    } catch (err) {
      console.error("❌ Error fetching interview transcript:", err);
    }
  }, [candidateId]);

  /** ✅ Fetch All Candidate Data on Load */
  useEffect(() => {
    fetchCandidate();
    fetchScorecard();
    fetchTranscript();
    setLoading(false);
  }, [fetchCandidate, fetchScorecard, fetchTranscript]);

  if (loading) {
    return <Spinner size="xl" color="purple.500" />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

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

  const radarData = scorecard.map(({ skill, score }) => ({
    skill,
    candidateScore: score
  }));

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Button colorScheme="purple" mb="6" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </Button>

      <Card mb="6" p="6" bg="white" shadow="md">
        <CardBody>
          <Heading size="xl" mb="2">{candidate.name}</Heading>
          <Text fontSize="lg" color="gray.600"><strong>Job Title:</strong> {candidate.job_title}</Text>
          <Text fontSize="lg" color="gray.600"><strong>Department:</strong> {candidate.department}</Text>
          <Text fontSize="lg" color="gray.600"><strong>Interview Date:</strong> {candidate.interview_date}</Text>
          <Text fontSize="lg" color="gray.600">
            <strong>Status:</strong> 
            <Tag colorScheme={candidate.status === "Hired" ? "green" : "red"} ml="2">
              {candidate.status}
            </Tag>
          </Text>
        </CardBody>
      </Card>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Scorecard</Tab>
          <Tab>Competency Radar</Tab>
          <Tab>Interview Transcript</Tab>
        </TabList>

        <TabPanels>
          {/* ✅ Scorecard */}
          <TabPanel>
            <Card p="6" bg="white" shadow="md">
              <CardBody>
                <Heading size="md" mb="4">Scorecard</Heading>
                {scorecard.length > 0 ? (
                  scorecard.map(({ skill, score }) => (
                    <Box key={skill} mb="3">
                      <Text><strong>{skill}:</strong> {score}/5</Text>
                      <Progress value={(score / 5) * 100} size="sm" colorScheme="purple" mt="1" />
                    </Box>
                  ))
                ) : <Text>No score data available.</Text>}
              </CardBody>
            </Card>
          </TabPanel>

          {/* ✅ Competency Radar Chart */}
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

          {/* ✅ Interview Transcript */}
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
