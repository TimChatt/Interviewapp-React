import React, { useState, useEffect } from "react";
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

  /** ✅ Fetch Frameworks & Job Title Counts concurrently */
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all frameworks (departments)
      const frameworksResponse = await fetch(
        "https://interviewappbe-production.up.railway.app/api/search-frameworks"
      );
      if (!frameworksResponse.ok)
        throw new Error("Failed to fetch frameworks.");
      const frameworksData = await frameworksResponse.json();
      const frameworksList = frameworksData.frameworks || [];

      console.log("✅ Frameworks:", frameworksList);

      // Create an array of promises to fetch job titles for each department concurrently
      const jobTitlePromises = frameworksList.map((framework) => {
        const departmentName = framework.department;
        if (!departmentName) {
          return Promise.resolve({ department: "", count: 0 });
        }
        return fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${encodeURIComponent(
            departmentName
          )}`
        )
          .then((resp) => {
            if (!resp.ok) {
              console.error(`❌ Failed to fetch job titles for ${departmentName}`);
              return { department: departmentName, count: 0 };
            }
            return resp.json();
          })
          .then((data) => ({
            department: departmentName,
            count: data.job_titles ? data.job_titles.length : 0,
          }))
          .catch((err) => {
            console.error(`❌ Error fetching job titles for ${departmentName}:`, err);
            return { department: departmentName, count: 0 };
          });
      });

      // Wait for all job title fetches to complete
      const results = await Promise.all(jobTitlePromises);

      // Create a map from department to job title count
      const departmentJobCounts = {};
      results.forEach((result) => {
        if (result.department) {
          departmentJobCounts[result.department] = result.count;
        }
      });

      console.log("✅ Job Title Counts:", departmentJobCounts);

      // Attach job title counts to frameworks
      const frameworksWithCounts = frameworksList.map((framework) => ({
        department: framework.department,
        jobTitleCount: departmentJobCounts[framework.department] || 0,
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
