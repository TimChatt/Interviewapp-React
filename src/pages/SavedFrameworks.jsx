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
  const [allFrameworks, setAllFrameworks] = useState([]);
  const [displayedFrameworks, setDisplayedFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch frameworks
        const frameworksResponse = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=`
        );
        if (!frameworksResponse.ok) {
          throw new Error("Failed to fetch frameworks.");
        }
        const frameworksData = await frameworksResponse.json();
        const frameworks = frameworksData.frameworks;

        // ✅ Fetch job titles
        const jobTitlesResponse = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=`
        );
        if (!jobTitlesResponse.ok) {
          throw new Error("Failed to fetch job titles.");
        }
        const jobTitlesData = await jobTitlesResponse.json();
        const jobTitlesList = jobTitlesData.job_titles;

        console.log("✅ Frameworks:", frameworks);
        console.log("✅ Job Titles:", jobTitlesList);

        // ✅ Map frameworks by department ID & count job titles
        const frameworksByDepartment = frameworks.map((framework) => {
          // ✅ Count job titles where department_id matches framework.id
          const jobTitleCount = jobTitlesList.filter(
            (job) => job.department_id === framework.id
          ).length;

          return {
            department: framework.department,
            jobTitleCount,
          };
        });

        setAllFrameworks(frameworksByDepartment);
        setDisplayedFrameworks(frameworksByDepartment);
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
      setDisplayedFrameworks(allFrameworks);
    } else {
      const filteredFrameworks = allFrameworks.filter((group) =>
        group.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedFrameworks(filteredFrameworks);
    }
  }, [searchQuery, allFrameworks]);

  const handleDepartmentClick = (department) => {
    navigate(`/frameworks/${department}`);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFrameworks = Array.from(displayedFrameworks);
    const [movedFramework] = reorderedFrameworks.splice(result.source.index, 1);
    reorderedFrameworks.splice(result.destination.index, 0, movedFramework);

    setDisplayedFrameworks(reorderedFrameworks);
    setAllFrameworks(reorderedFrameworks);
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

      {!loading && !error && displayedFrameworks.length === 0 && (
        <Box textAlign="center">
          <Text>No saved frameworks found. Start by generating a new framework.</Text>
        </Box>
      )}

      {!loading && !error && displayedFrameworks.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="frameworks">
            {(provided) => (
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {displayedFrameworks.map((group, index) => (
                  <Draggable key={group.department} draggableId={group.department} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        p={6}
                        shadow="md"
                        borderRadius="lg"
                        bg="white"
                        cursor="grab"
                      >
                        <CardBody>
                          <Heading
                            size="md"
                            color="blue.600"
                            onClick={() => handleDepartmentClick(group.department)}
                            _hover={{ textDecoration: "underline", cursor: "pointer" }}
                          >
                            {group.department}
                          </Heading>
                          <Text mt={2} fontSize="sm" color="gray.600">
                            {group.jobTitleCount} Job Titles
                          </Text>
                        </CardBody>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Box>
  );
};

export default SavedFrameworks;
