iimport React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Input,
  Grid,
  Card,
  CardBody,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  /** ✅ Fetch Frameworks & Job Titles */
  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch all frameworks (departments)
      const frameworksResponse = await fetch(
        `https://interviewappbe-production.up.railway.app/api/search-frameworks`
      );
      if (!frameworksResponse.ok) throw new Error("Failed to fetch frameworks.");
      const frameworksData = await frameworksResponse.json();
      const frameworksList = frameworksData.frameworks || [];

      console.log("✅ Frameworks:", frameworksList);

      // ✅ Fetch job titles for each department separately
      const departmentJobCounts = {};

      for (const framework of frameworksList) {
        const departmentName = framework.department;

        if (!departmentName) continue;

        const jobTitlesResponse = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${encodeURIComponent(departmentName)}`
        );

        if (!jobTitlesResponse.ok) {
          console.error(`❌ Failed to fetch job titles for ${departmentName}`);
          continue;
        }

        const jobTitlesData = await jobTitlesResponse.json();

        // ✅ Store the number of job titles for each department
        departmentJobCounts[departmentName] = jobTitlesData.job_titles?.length || 0;
      }

      console.log("✅ Job Title Counts:", departmentJobCounts);

      // ✅ Attach job title counts to frameworks
      const frameworksWithCounts = frameworksList.map((framework) => ({
        department: framework.department,
        jobTitleCount: departmentJobCounts[framework.department] || 0, // Default to 0 if missing
      }));

      setFrameworks(frameworksWithCounts);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Filter Frameworks */
  const filteredFrameworks = frameworks.filter((framework) =>
    framework.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** ✅ Navigate to Department Framework */
  const handleDepartmentClick = (department) => {
    navigate(`/frameworks/${department}`);
  };

  return (
    <Box minH="100vh" p={8} bg="gray.50">
      <Heading size="xl" textAlign="center" mb={6}>
        Saved Competency Frameworks
      </Heading>

      {/* Search Input */}
      <VStack spacing={4} mb={6} align="center">
        <Input
          placeholder="Search by department"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="300px"
          bg="white"
          borderRadius="md"
          shadow="sm"
        />
      </VStack>

      {loading && (
        <Box display="flex" justifyContent="center">
          <Spinner size="xl" />
        </Box>
      )}

      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && filteredFrameworks.length === 0 && (
        <Box textAlign="center" color="gray.600" mt="4">
          <Text>No saved frameworks found. Start by generating a new framework.</Text>
        </Box>
      )}

      {!loading && !error && filteredFrameworks.length > 0 && (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {filteredFrameworks.map((group, index) => (
            <Card
              key={index}
              p={6}
              shadow="md"
              borderRadius="lg"
              bg="white"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleDepartmentClick(group.department)}
            >
              <CardBody>
                <Heading size="md" color="blue.600">
                  {group.department}
                </Heading>
                <Text mt={2} fontSize="sm" color="gray.600">
                  {group.jobTitleCount} Job Titles
                </Text>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SavedFrameworks;
