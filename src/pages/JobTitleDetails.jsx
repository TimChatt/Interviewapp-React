import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  useToast,
  Spinner
} from "@chakra-ui/react";

const JobTitleDetails = () => {
  const { department, jobTitle, jobLevel } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSalaryMin, setEditedSalaryMin] = useState("");
  const [editedSalaryMax, setEditedSalaryMax] = useState("");
  const [editedCompetencies, setEditedCompetencies] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-title-details/${department}/${jobTitle}/${jobLevel}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job title details.");
        }
        const data = await response.json();
        setJobDetails(data);
        setEditedSalaryMin(data.salary_min || "");
        setEditedSalaryMax(data.salary_max || "");
        setEditedCompetencies(data.competencies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [department, jobTitle, jobLevel]);

  const handleEditClick = () => setIsEditing((prev) => !prev);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/update-job-title-details/${department}/${jobTitle}/${jobLevel}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaryMin: Number(editedSalaryMin) || 0,
            salaryMax: Number(editedSalaryMax) || 0,
            competencies: editedCompetencies,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update job details.");

      setJobDetails((prev) => ({
        ...prev,
        salary_min: editedSalaryMin,
        salary_max: editedSalaryMax,
        competencies: editedCompetencies,
      }));

      setIsEditing(false);
      toast({
        title: "Success!",
        description: "Job details updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportToCSV = () => {
    if (!jobDetails) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Department,Job Title,Job Level,Salary Min,Salary Max\n`;
    csvContent += `${department},${jobTitle},${jobLevel},${jobDetails.salary_min},${jobDetails.salary_max}\n\n`;
    csvContent += "Competency Name,Level,Description\n";

    jobDetails.competencies.forEach((comp) => {
      Object.entries(comp.descriptions).forEach(([lvl, desc]) => {
        csvContent += `${comp.name},${lvl},${desc}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${department}-${jobTitle}-${jobLevel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Spinner size="xl" mt={10} />;
  if (error) return <Text color="red.500" textAlign="center">{error}</Text>;

  return (
    <Box maxW="800px" mx="auto" py="6">
      <Heading size="lg" textAlign="center" color="purple.600" mb="4">
        {department} - {jobTitle} - {jobLevel} Framework
      </Heading>

      <HStack spacing={4} justify="center" mb={6}>
        <Button colorScheme="blue" onClick={handleExportToCSV}>Export to CSV</Button>
        {isEditing ? (
          <Button colorScheme="green" onClick={handleSave}>Save</Button>
        ) : (
          <Button colorScheme="purple" onClick={handleEditClick}>Edit</Button>
        )}
      </HStack>

      <Box bg="white" p="5" shadow="md" borderRadius="lg">
        <Heading size="md" color="gray.700" mb="3">💰 Salary Banding</Heading>
        {isEditing ? (
          <HStack spacing={4}>
            <Input
              placeholder="Min Salary"
              value={editedSalaryMin}
              onChange={(e) => setEditedSalaryMin(e.target.value)}
            />
            <Input
              placeholder="Max Salary"
              value={editedSalaryMax}
              onChange={(e) => setEditedSalaryMax(e.target.value)}
            />
          </HStack>
        ) : (
          <Text><strong>Min:</strong> {jobDetails.salary_min} | <strong>Max:</strong> {jobDetails.salary_max}</Text>
        )}
      </Box>

      <Box bg="white" p="5" shadow="md" borderRadius="lg" mt={5}>
        <Heading size="md" color="gray.700" mb="3">📌 Competencies</Heading>
        {isEditing ? (
          <VStack spacing={4} align="start">
            {editedCompetencies.map((comp, compIndex) => (
              <Box key={compIndex} w="100%">
                <Text fontWeight="bold" color="purple.600">{comp.name}</Text>
                {Object.entries(comp.descriptions).map(([lvlKey, descVal]) => (
                  <HStack key={lvlKey} spacing={4} mt={2}>
                    <Text fontWeight="bold">{lvlKey}:</Text>
                    <Input
                      value={descVal}
                      onChange={(e) => {
                        const updated = [...editedCompetencies];
                        updated[compIndex].descriptions[lvlKey] = e.target.value;
                        setEditedCompetencies(updated);
                      }}
                    />
                  </HStack>
                ))}
              </Box>
            ))}
          </VStack>
        ) : (
          <Table variant="simple" mt="3">
            <Thead>
              <Tr>
                <Th>Competency</Th>
                <Th>Level</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobDetails.competencies.map((comp, i) => (
                Object.entries(comp.descriptions).map(([lvl, desc], idx) => (
                  <Tr key={`${i}-${idx}`}>
                    <Td fontWeight="bold">{comp.name}</Td>
                    <Td>{lvl}</Td>
                    <Td>{desc}</Td>
                  </Tr>
                ))
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default JobTitleDetails;
