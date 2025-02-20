import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiBarChart, FiSettings } from "react-icons/fi"; // Import icons
import { MdLightbulb } from "react-icons/md"; // Use Material Design Lightbulb
import {
  Box, Heading, Text, Grid, GridItem, Card, CardBody, Stat, StatLabel, StatNumber, VStack, Icon
} from "@chakra-ui/react";
import ashbyMockData from "../mockdata/ashbyMockData.json";

function Home() {
  const navigate = useNavigate();

  // Basic stats from Ashby data
  const [total, setTotal] = useState(0);
  const [hired, setHired] = useState(0);
  const [archived, setArchived] = useState(0);

  useEffect(() => {
    const totalCandidates = ashbyMockData.length;
    const hiredCandidates = ashbyMockData.filter((c) => c.status === "Hired").length;
    const archivedCandidates = ashbyMockData.filter((c) => c.status === "Archived").length;

    setTotal(totalCandidates);
    setHired(hiredCandidates);
    setArchived(archivedCandidates);
  }, []);

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="4">
        Welcome to the Interview Analysis App
      </Heading>
      <Text fontSize="lg" textAlign="center" color="gray.600" mb="6">
        This platform combines data from Ashby and Metaview to help you track, review, and improve
        your interviewing process. Explore candidate management, insights, and personalized recommendations.
      </Text>

      {/* Quick Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb="8">
        <StatCard title="Total Candidates" value={total} />
        <StatCard title="Hired" value={hired} />
        <StatCard title="Archived" value={archived} />
      </Grid>

      {/* Navigation Cards with Icons */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <NavCard
          title="Candidates"
          description="Manage candidate data and view detailed profiles."
          icon={FiUsers}
          onClick={() => navigate("/candidates")}
        />
        <NavCard
          title="Insights"
          description="Visualize hiring metrics, interview trends, and more."
          icon={FiBarChart}
          onClick={() => navigate("/insights")}
        />
        <NavCard
          title="Recommendations"
          description="Get actionable suggestions to improve the hiring process."
          icon={MdLightbulb} // Replaced with Material Design version
          onClick={() => navigate("/recommendations")}
        />
        <NavCard
          title="Admin"
          description="Manage system settings, permissions, and advanced tasks."
          icon={FiSettings}
          onClick={() => navigate("/admin")}
        />
      </Grid>
    </Box>
  );
}

// Reusable Stat Card Component
const StatCard = ({ title, value }) => {
  return (
    <Card bg="white" shadow="md" borderRadius="lg">
      <CardBody>
        <Stat textAlign="center">
          <StatLabel fontSize="lg" color="gray.600">{title}</StatLabel>
          <StatNumber fontSize="3xl" color="purple.600">{value}</StatNumber>
        </Stat>
      </CardBody>
    </Card>
  );
};

// Reusable Navigation Card Component with Icons
const NavCard = ({ title, description, icon, onClick }) => {
  return (
    <GridItem>
      <Card
        bg="white"
        shadow="md"
        borderRadius="lg"
        cursor="pointer"
        transition="transform 0.2s ease, box-shadow 0.2s ease"
        _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
        onClick={onClick}
      >
        <CardBody textAlign="center">
          <VStack spacing={3}>
            <Icon as={icon} boxSize={8} color="purple.500" /> {/* Added icon */}
            <Heading size="md" color="purple.700">{title}</Heading>
            <Text color="gray.600">{description}</Text>
          </VStack>
        </CardBody>
      </Card>
    </GridItem>
  );
};

export default Home;
