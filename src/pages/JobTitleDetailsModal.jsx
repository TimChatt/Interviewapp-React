import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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

const JobTitleDetailsModal = ({ isOpen, onClose, department, jobTitle, jobLevel }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSalaryMin, setEditedSalaryMin] = useState("");
  const [editedSalaryMax, setEditedSalaryMax] = useState("");
  const [editedCompetencies, setEditedCompetencies] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-title-details/${department}/${jobTitle}/${jobLevel}`
        );

        if (!response.ok) throw new Error("Failed to fetch job title details.");

        const data = await response.json();
        console.log("Fetched Job Details:", data);
        console.log("Competencies from API:", data.competencies);

        setJobDetails(data);
        setEditedSalaryMin(data.salary_min || "");
        setEditedSalaryMax(data.salary_max || "");
        setEditedCompetencies(Array.isArray(data.competencies) ? data.competencies : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [isOpen, department, jobTitle, jobLevel]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {department} - {jobTitle} - {jobLevel} Framework
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" mt={5} />
          ) : error ? (
            <Text color="red.500" textAlign="center">{error}</Text>
          ) : (
            <VStack spacing={5} align="stretch">
              <HStack spacing={4} justify="center">
                <Button colorScheme="blue" onClick={handleExportToCSV}>Export to CSV</Button>
                {isEditing ? (
                  <Button colorScheme="green" onClick={handleSave}>Save</Button>
                ) : (
                  <Button colorScheme="purple" onClick={handleEditClick}>Edit</Button>
                )}
              </HStack>

              {/* Salary Banding */}
              <Box bg="gray.50" p={5} borderRadius="md" shadow="sm">
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
                  <Text>
                    <strong>Min:</strong> {jobDetails.salary_min} | <strong>Max:</strong> {jobDetails.salary_max}
                  </Text>
                )}
              </Box>

              {/* Competencies Section */}
              <Box bg="gray.50" p={5} borderRadius="md" shadow="sm">
                <Heading size="md" color="gray.700" mb="3">📌 Competencies</Heading>
                {editedCompetencies.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Competency</Th>
                        <Th>Level</Th>
                        <Th>Description</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {editedCompetencies.map((comp, i) =>
                        Object.entries(comp.descriptions || {}).map(([lvl, desc], idx) => (
                          <Tr key={`${i}-${idx}`}>
                            <Td fontWeight="bold">{comp.name}</Td>
                            <Td>{lvl}</Td>
                            <Td>{desc}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500">No competencies available.</Text>
                )}
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobTitleDetailsModal;
