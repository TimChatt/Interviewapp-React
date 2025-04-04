import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  UnorderedList,
  ListItem,
  Alert,
  AlertIcon,
  Text
} from "@chakra-ui/react";

const CompetencyFramework = () => {
  const [framework, setFramework] = useState({
    department: "", // will store the department id
    jobTitle: "", // will store the job title string
    jobLevels: [],
    competencies: [],
  });
  const [departments, setDepartments] = useState([]);
  const [allJobTitles, setAllJobTitles] = useState([]);
  const [jobLevelInput, setJobLevelInput] = useState("");
  const [competencyInput, setCompetencyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Department autocomplete state and ref
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const departmentContainerRef = useRef(null);

  // Job Title autocomplete state and ref
  const [jobTitleQuery, setJobTitleQuery] = useState("");
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const jobTitleContainerRef = useRef(null);

  // Close department dropdown when clicking outside
  useEffect(() => {
    const handleClickOutsideDept = (e) => {
      if (
        departmentContainerRef.current &&
        !departmentContainerRef.current.contains(e.target)
      ) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDept);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDept);
  }, []);

  // Close job title dropdown when clicking outside, and update jobTitle if needed
  useEffect(() => {
    const handleClickOutsideJobTitle = (e) => {
      if (
        jobTitleContainerRef.current &&
        !jobTitleContainerRef.current.contains(e.target)
      ) {
        setShowJobTitleDropdown(false);
        if (jobTitleQuery.trim() && framework.jobTitle !== jobTitleQuery.trim()) {
          setFramework((prev) => ({ ...prev, jobTitle: jobTitleQuery.trim() }));
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutsideJobTitle);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideJobTitle);
  }, [jobTitleQuery, framework.jobTitle]);

  // Filter departments using a safe check for name
  const filteredDepartments = departments.filter((dep) => {
    if (!dep || typeof dep !== "object") return false;
    const name = ((dep.name || dep.department) || "").toString().toLowerCase();
    return name.includes(departmentQuery.toLowerCase());
  });

  // Filter job titles using the proper key "job_title"
  const filteredJobTitles = allJobTitles.filter((job) => {
    if (!job || typeof job !== "object") return false;
    return ((job.job_title || "")).toString().toLowerCase().includes(jobTitleQuery.toLowerCase());
  });

  // Fetch all departments
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("https://interviewappbe-production.up.railway.app/api/departments/list");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data.departments);
      } catch (err) {
        setError("Failed to load departments.");
        console.error(err);
      }
    }
    fetchDepartments();
  }, []);

  // Fetch all job titles (ignoring department) for the autocomplete
  useEffect(() => {
    async function fetchAllJobTitles() {
      try {
        const res = await fetch("https://interviewappbe-production.up.railway.app/api/job-titles/all");
        if (!res.ok) throw new Error("Failed to fetch job titles");
        const data = await res.json();
        setAllJobTitles(data.job_titles);
      } catch (err) {
        setError("Failed to load job titles.");
        console.error(err);
      }
    }
    fetchAllJobTitles();
  }, []);

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
        competencies: [
          ...prev.competencies,
          { name: competencyInput.trim(), descriptions: {} },
        ],
      }));
      setCompetencyInput("");
    }
  };

  // Generate competency descriptions
  const autoGenerateDescriptions = async () => {
    setError(null);
    if (
      !framework.department ||
      !framework.jobTitle ||
      !framework.jobLevels.length ||
      !framework.competencies.length
    ) {
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
      if (data.success) {
        // Update each competency with its generated descriptions
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

  // Save competency framework
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
  <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
    Competency Framework
  </Heading>
    
      <VStack spacing="4" align="stretch">
        {/* Department Autocomplete */}
        <Box ref={departmentContainerRef} position="relative">
          <Input
            placeholder="Select Department"
            value={departmentQuery}
            onChange={(e) => {
              setDepartmentQuery(e.target.value);
              setShowDeptDropdown(true);
            }}
            onFocus={() => setShowDeptDropdown(true)}
            color="black"
          />
          {showDeptDropdown && filteredDepartments.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              bg="white"
              border="1px solid #ccc"
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              zIndex={10}
            >
              {filteredDepartments.map((dep) => {
                const displayName = dep.name || dep.department || "";
                return (
                  <Box
                    key={dep.id}
                    p="2"
                    cursor="pointer"
                    color="black"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => {
                      setFramework((prev) => ({ ...prev, department: dep.id }));
                      setDepartmentQuery(displayName);
                      setShowDeptDropdown(false);
                    }}
                  >
                    {displayName}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Job Title Autocomplete */}
        <Box ref={jobTitleContainerRef} position="relative">
          <Input
            placeholder="Select or Add Job Title"
            value={jobTitleQuery}
            onChange={(e) => {
              setJobTitleQuery(e.target.value);
              setShowJobTitleDropdown(true);
            }}
            onFocus={() => setShowJobTitleDropdown(true)}
            color="black"
          />
          {showJobTitleDropdown && filteredJobTitles.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              bg="white"
              border="1px solid #ccc"
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              zIndex={10}
            >
              {filteredJobTitles.map((job) => (
                <Box
                  key={job.id}
                  p="2"
                  cursor="pointer"
                  color="black"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => {
                    setFramework((prev) => ({ ...prev, jobTitle: job.job_title }));
                    setJobTitleQuery(job.job_title);
                    setShowJobTitleDropdown(false);
                  }}
                >
                  {job.job_title}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Job Levels */}
        <Box>
          <Heading size="md" mb="2">
            Job Levels
          </Heading>
          <HStack>
            <Input
              placeholder="Add a job level"
              value={jobLevelInput}
              onChange={(e) => setJobLevelInput(e.target.value)}
            />
            <Button colorScheme="blue" onClick={addJobLevel}>
              Add
            </Button>
          </HStack>
          <UnorderedList mt="2">
            {framework.jobLevels.map((level, index) => (
              <ListItem key={index}>{level}</ListItem>
            ))}
          </UnorderedList>
        </Box>

        {/* Competencies */}
        <Box>
          <Heading size="md" mb="2">
            Competencies
          </Heading>
          <HStack>
            <Input
              placeholder="Add a competency"
              value={competencyInput}
              onChange={(e) => setCompetencyInput(e.target.value)}
            />
            <Button colorScheme="blue" onClick={addCompetency}>
              Add
            </Button>
          </HStack>
          <UnorderedList mt="2">
            {framework.competencies.map((competency, index) => (
              <ListItem key={index}>
                <strong>{competency.name}</strong>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>

        {/* Display Competency Descriptions */}
        {framework.competencies.length > 0 && (
          <Box mt="6">
            <Heading size="md" mb="2">
              Competency Descriptions
            </Heading>
            {framework.competencies.map((competency, index) => (
              <Box key={index} p="2" borderWidth="1px" borderColor="gray.200" borderRadius="md" mb="2">
                <Text fontWeight="bold">{competency.name}</Text>
                {competency.descriptions &&
                  Object.entries(competency.descriptions).map(([level, desc]) => (
                    <Text key={level} fontSize="sm" ml="4">
                      {level}: {desc}
                    </Text>
                  ))}
              </Box>
            ))}
          </Box>
        )}
      </VStack>

      <VStack mt="6">
        <Button colorScheme="purple" onClick={autoGenerateDescriptions} isLoading={loading}>
          Generate Descriptions
        </Button>
        <Button colorScheme="green" onClick={saveCompetencies} isLoading={loading}>
          Save Framework
        </Button>
      </VStack>

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {success && (
        <Alert status="success" mt="4">
          <AlertIcon />
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default CompetencyFramework;
