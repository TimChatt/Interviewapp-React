import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Heading, Input, Button, VStack, HStack, Select, UnorderedList, ListItem,
  Alert, AlertIcon, Card, CardBody, Spinner, Grid, GridItem, Text
} from "@chakra-ui/react";

const CompetencyFramework = () => {
  const [framework, setFramework] = useState({
    department: "",
    jobTitle: "",
    jobLevels: [],
    competencies: [],
  });
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [jobLevelInput, setJobLevelInput] = useState("");
  const [competencyInput, setCompetencyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetch departments and job titles
  useEffect(() => {
    async function fetchData() {
      try {
        const depRes = await fetch("https://interviewappbe-production.up.railway.app/api/departments/list");
        if (!depRes.ok) throw new Error("Failed to fetch departments");
  
        const depData = await depRes.json();
        setDepartments(depData.departments);
  
        // ✅ Fetch job titles for the first department
        if (depData.departments.length > 0) {
          const firstDepartment = depData.departments[0].department;
  
          const jobRes = await fetch(
            `https://interviewappbe-production.up.railway.app/api/job-titles/by-department?department=${encodeURIComponent(firstDepartment)}`
          );
  
          if (!jobRes.ok) throw new Error("Failed to fetch job titles");
  
          const jobData = await jobRes.json();
          setJobTitles(jobData.job_titles);
        }
      } catch (err) {
        setError("Failed to load departments or job titles.");
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, []);
  

  // Handle job title selection or manual input
  const handleJobTitleChange = (e) => {
    const selected = e.target.value;
    setSelectedJobTitle(selected);

    if (selected === "custom") {
      setFramework((prev) => ({ ...prev, jobTitle: "" }));
    } else {
      setFramework((prev) => ({ ...prev, jobTitle: selected }));
    }
  };

  // Add individual job levels
  const addJobLevel = () => {
    if (jobLevelInput.trim()) {
      setFramework((prev) => ({
        ...prev,
        jobLevels: [...prev.jobLevels, jobLevelInput.trim()],
      }));
      setJobLevelInput("");
    }
  };

  // Add individual competencies
  const addCompetency = () => {
    if (competencyInput.trim()) {
      setFramework((prev) => ({
        ...prev,
        competencies: [...prev.competencies, { name: competencyInput.trim(), descriptions: {} }],
      }));
      setCompetencyInput("");
    }
  };

  // ✅ Generate competency descriptions
  const autoGenerateDescriptions = async () => {
    setError(null);

    if (!framework.department || !framework.jobTitle || !framework.jobLevels.length || !framework.competencies.length) {
      setError("Please fill in all fields and add at least one job level and competency.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/generate-competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: framework.department,
          jobTitle: framework.jobTitle,
          jobLevels: framework.jobLevels,
          competencies: framework.competencies.map((c) => c.name),
        }),
      });

      if (!response.ok) {
        setError(`Error: ${response.status} - ${response.statusText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        const updatedCompetencies = framework.competencies.map((competency, index) => ({
          ...competency,
          descriptions: data.competencyDescriptions[index]?.levels || {},
        }));

        setFramework((prev) => ({
          ...prev,
          competencies: updatedCompetencies,
        }));

        setError(null);
      } else {
        setError("Failed to generate competency descriptions.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save competency framework
  const saveCompetencies = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const jobTitlesPayload = framework.jobLevels.map((jobLevel) => ({
      job_title: `${framework.jobTitle} ${jobLevel}`,
      job_levels: [jobLevel],
      competencies: framework.competencies.map((competency) => ({
        name: competency.name,
        descriptions: competency.descriptions,
      })),
    }));

    const requestBody = { department: framework.department, jobTitles: jobTitlesPayload };

    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/save-competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setError(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSuccess("Competency framework saved successfully!");
      } else {
        setError("Failed to save competency framework.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Competency Framework Generator
      </Heading>

      <VStack spacing="4" align="stretch">
        {/* Department Dropdown */}
        <Select placeholder="Select Department" value={framework.department} onChange={(e) => setFramework((prev) => ({ ...prev, department: e.target.value }))}>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </Select>

        {/* Job Title Dropdown or Input */}
        <Select placeholder="Select Job Title" value={selectedJobTitle} onChange={handleJobTitleChange}>
          {jobTitles.map((job) => (
            <option key={job.id} value={job.title}>{job.title}</option>
          ))}
          <option value="custom">Create New Job Title</option>
        </Select>

        {selectedJobTitle === "custom" && (
          <Input placeholder="Enter New Job Title" value={framework.jobTitle} onChange={(e) => setFramework((prev) => ({ ...prev, jobTitle: e.target.value }))} />
        )}

        {/* Job Levels */}
        <Box>
          <Heading size="md" mb="2">Job Levels</Heading>
          <HStack>
            <Input placeholder="Add a job level" value={jobLevelInput} onChange={(e) => setJobLevelInput(e.target.value)} />
            <Button colorScheme="blue" onClick={addJobLevel}>Add</Button>
          </HStack>
          <UnorderedList mt="2">
            {framework.jobLevels.map((level, index) => <ListItem key={index}>{level}</ListItem>)}
          </UnorderedList>
        </Box>

        {/* Competencies */}
        <Box>
          <Heading size="md" mb="2">Competencies</Heading>
          <HStack>
            <Input placeholder="Add a competency" value={competencyInput} onChange={(e) => setCompetencyInput(e.target.value)} />
            <Button colorScheme="blue" onClick={addCompetency}>Add</Button>
          </HStack>
          <UnorderedList mt="2">
            {framework.competencies.map((competency, index) => <ListItem key={index}><strong>{competency.name}</strong></ListItem>)}
          </UnorderedList>
        </Box>
      </VStack>

      {/* Buttons */}
      <VStack mt="6">
        <Button colorScheme="purple" onClick={autoGenerateDescriptions} isLoading={loading}>
          Generate Descriptions
        </Button>
        <Button colorScheme="green" onClick={saveCompetencies} isLoading={loading}>
          Save Framework
        </Button>
      </VStack>

      {error && <Alert status="error" mt="4"><AlertIcon />{error}</Alert>}
      {success && <Alert status="success" mt="4"><AlertIcon />{success}</Alert>}
    </Box>
  );
};

export default CompetencyFramework;
