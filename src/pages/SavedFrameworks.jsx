import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box,
  Heading,
  Input,
  Button,
  Grid,
  Card,
  CardBody,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const SavedFrameworks = () => {
  const [allFrameworks, setAllFrameworks] = useState([]);
  const [displayedFrameworks, setDisplayedFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched all frameworks:", data.frameworks);

        const frameworksByDepartment = data.frameworks.reduce((acc, framework) => {
          if (!acc[framework.department]) acc[framework.department] = [];
          acc[framework.department].push({
            ...framework,
            jobTitles: framework.job_titles || [],
          });
          return acc;
        }, {});

        const groupedFrameworks = Object.entries(frameworksByDepartment).map(
          ([department, frameworks]) => ({
            department,
            frameworks,
          })
        );

        setAllFrameworks(groupedFrameworks);
        setDisplayedFrameworks(groupedFrameworks);
        setError(null);
      } catch (err) {
        console.error("Error fetching frameworks:", err);
        setError("Failed to fetch saved frameworks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this framework?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/delete-framework/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete framework");
      }

      alert("Framework deleted successfully!");
      setAllFrameworks(allFrameworks.filter((framework) => framework.id !== id));
    } catch (error) {
      console.error("Error deleting framework:", error);
      alert("An error occurred while deleting the framework. Please try again.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-framework/${id}`);
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
          <Button mt={4} colorScheme="blue" onClick={() => navigate("/competency-framework-planner")}>
            Generate New Framework
          </Button>
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
                          <Heading size="md" color="blue.600" onClick={() => handleDepartmentClick(group.department)}>
                            {group.department}
                          </Heading>
                          <Text mt={2} fontSize="sm" color="gray.600">
                            {group.frameworks.length} Job Titles
                          </Text>

                          <VStack mt={4} spacing={2} align="start">
                            {group.frameworks.map((framework, idx) => (
                              <Text key={idx} fontSize="sm" color="gray.500">
                                {framework.jobTitles.map((title) => title.job_title).join(", ")}
                              </Text>
                            ))}
                          </VStack>

                          <VStack mt={4} spacing={2} align="start">
                            <Button size="sm" colorScheme="blue" onClick={() => handleEdit(group.department)}>
                              Edit Framework
                            </Button>
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<DeleteIcon />}
                              aria-label="Delete Framework"
                              onClick={() => handleDelete(group.department)}
                            />
                          </VStack>
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
