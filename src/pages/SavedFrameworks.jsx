import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
} from "@chakra-ui/react";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch all frameworks (departments)
        const frameworksResponse = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=`
        );
        if (!frameworksResponse.ok) throw new Error("Failed to fetch frameworks.");
        const frameworksData = await frameworksResponse.json();
        const frameworks = frameworksData.frameworks;

        // ✅ Fetch all job titles
        const jobTitlesResponse = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=`
        );
        if (!jobTitlesResponse.ok) throw new Error("Failed to fetch job titles.");
        const jobTitlesData = await jobTitlesResponse.json();
        const jobTitlesList = jobTitlesData.job_titles;

        console.log("✅ Frameworks:", frameworks);
        console.log("✅ Job Titles:", jobTitlesList);

        // ✅ Count job titles per department
        const jobTitleCounts = {};
        jobTitlesList.forEach((job) => {
          if (job.department_id) {
            jobTitleCounts[job.department_id] = (jobTitleCounts[job.department_id] || 0) + 1;
          }
        });

        // ✅ Map frameworks with job title counts
        const frameworksWithCounts = frameworks.map((framework) => ({
          department: framework.department,
          jobTitleCount: jobTitleCounts[framework.id] || 0, // Default to 0 if no job titles exist
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

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFrameworks(frameworks);
    } else {
      const filteredFrameworks = frameworks.filter((group) =>
        group.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFrameworks(filteredFrameworks);
    }
  }, [searchQuery]);

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
      {error && <Text color="red.500" textAlign="center">{error}</Text>}

      {!loading && !error && frameworks.length === 0 && (
        <Box textAlign="center">
          <Text>No saved frameworks found. Start by generating a new framework.</Text>
        </Box>
      )}

      {!loading && !error && frameworks.length > 0 && (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {frameworks.map((group, index) => (
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
