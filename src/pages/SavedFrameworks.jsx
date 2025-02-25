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
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

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
      const frameworksList = frameworksData.frameworks;

      console.log("✅ Frameworks:", frameworksList);

      // ✅ Fetch job titles for each department separately
      const departmentJobCounts = {};
      const departmentJobLevels = {};

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

        // ✅ Store job title count
        departmentJobCounts[departmentName] = jobTitlesData.job_titles.length || 0;

        // ✅ Count job levels per department
        departmentJobLevels[departmentName] = {
          L1: jobTitlesData.job_titles.filter((job) => job.job_levels.includes("L1")).length,
          L2: jobTitlesData.job_titles.filter((job) => job.job_levels.includes("L2")).length,
          L3: jobTitlesData.job_titles.filter((job) => job.job_levels.includes("L3")).length,
          L4: jobTitlesData.job_titles.filter((job) => job.job_levels.includes("L4")).length,
        };
      }

      console.log("✅ Job Title Counts:", departmentJobCounts);
      console.log("✅ Job Levels Data:", departmentJobLevels);

      // ✅ Attach job title counts & job level data to frameworks
      const frameworksWithCounts = frameworksList.map((framework) => ({
        department: framework.department,
        jobTitleCount: departmentJobCounts[framework.department] || 0,
        jobLevels: departmentJobLevels[framework.department] || { L1: 0, L2: 0, L3: 0, L4: 0 },
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

  const handleDepartmentClick = (department) => {
    navigate(`/frameworks/${department}`);
  };

  /** ✅ Prepare Data for Graph */
  const graphData = frameworks.map((framework) => ({
    department: framework.department,
    ...framework.jobLevels,
  }));

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
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && frameworks.length === 0 && (
        <Box textAlign="center">
          <Text>No saved frameworks found. Start by generating a new framework.</Text>
        </Box>
      )}

      {!loading && !error && frameworks.length > 0 && (
        <>
          {/* 📊 Bar Chart for Job Levels */}
          <Box mt="6">
            <Heading size="md" mb="4">📊 Job Levels Distribution</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graphData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" />
                <Tooltip />
                <Bar dataKey="L1" fill="#8884d8" />
                <Bar dataKey="L2" fill="#82ca9d" />
                <Bar dataKey="L3" fill="#ffc658" />
                <Bar dataKey="L4" fill="#d84b4b" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 🔥 Department Frameworks */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mt="8">
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
        </>
      )}
    </Box>
  );
};

export default SavedFrameworks;
