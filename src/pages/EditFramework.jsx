import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Input, Button, VStack, FormControl, FormLabel, Textarea, Alert, AlertIcon,
  Spinner, Card, CardBody, Flex
} from "@chakra-ui/react";

const EditFramework = () => {
  const { id } = useParams(); // Get framework ID from the URL
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedFramework, setUpdatedFramework] = useState({
    department: "",
    job_title: "",
    job_levels: "",
    competencies: [],
  });

  // Fetch the framework details by ID
  useEffect(() => {
    const fetchFramework = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-framework/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setFramework(data);
        setUpdatedFramework({
          department: data.department,
          job_title: data.job_title,
          job_levels: data.job_levels,
          competencies: data.competencies,
        });
        setError(null);
      } catch (err) {
        setError("Failed to fetch framework details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedFramework((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to update the framework
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/update-framework/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFramework),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      navigate("/frameworks"); // Redirect to the frameworks page after successful update
    } catch (err) {
      setError("Failed to update framework. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="800px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Edit Framework
      </Heading>

      {error && (
        <Alert status="error" mb="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {framework && (
        <Card bg="white" shadow="md" borderRadius="lg">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing="4" align="stretch">
                <FormControl isRequired>
                  <FormLabel>Department</FormLabel>
                  <Input
                    type="text"
                    name="department"
                    value={updatedFramework.department}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Job Title</FormLabel>
                  <Input
                    type="text"
                    name="job_title"
                    value={updatedFramework.job_title}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Job Levels</FormLabel>
                  <Input
                    type="text"
                    name="job_levels"
                    value={updatedFramework.job_levels}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Competencies (JSON format)</FormLabel>
                  <Textarea
                    name="competencies"
                    value={JSON.stringify(updatedFramework.competencies, null, 2)}
                    onChange={(e) =>
                      setUpdatedFramework((prev) => ({
                        ...prev,
                        competencies: JSON.parse(e.target.value),
                      }))
                    }
                    rows={5}
                  />
                </FormControl>

                <Flex justify="space-between" mt="4">
                  <Button colorScheme="green" type="submit" isLoading={loading}>
                    Save Changes
                  </Button>
                  <Button colorScheme="gray" onClick={() => navigate("/frameworks")}>
                    Cancel
                  </Button>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default EditFramework;
