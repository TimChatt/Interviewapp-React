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

const API_BASE = process.env.REACT_APP_API_BASE_URL
  || "https://interviewappbe-production.up.railway.app";

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
    setLoading(true);
    fetch(`${API_BASE}/api/get-job-title-details/${department}/${jobTitle}/${jobLevel}`)
      .then(r => r.json())
      .then(data => {
        setJobDetails(data);
        setEditedSalaryMin(data.salary_min || "");
        setEditedSalaryMax(data.salary_max || "");
        setEditedCompetencies(Array.isArray(data.competencies) ? data.competencies : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, department, jobTitle, jobLevel]);

  const handleEditClick = () => setIsEditing(prev => !prev);

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/update-job-title-details/${department}/${jobTitle}/${jobLevel}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaryMin: Number(editedSalaryMin) || 0,
            salaryMax: Number(editedSalaryMax) || 0,
            // now sending the Brave/Owners/Inclusive breakdown
            competencies: editedCompetencies
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update job details.");
      setJobDetails(prev => ({
        ...prev,
        salary_min: editedSalaryMin,
        salary_max: editedSalaryMax,
        competencies: editedCompetencies
      }));
      setIsEditing(false);
      toast({ title: "Saved", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleExportToCSV = () => {
    if (!jobDetails) return;
    let csv = [
      ["Department", "Job Title", "Job Level", "Salary Min", "Salary Max"],
      [department, jobTitle, jobLevel, jobDetails.salary_min, jobDetails.salary_max],
      [],
      ["Competency", "Brave", "Owners", "Inclusive"]
    ]
      .map(row => row.join(","))
      .join("\r\n");

    jobDetails.competencies.forEach(comp => {
      const d = comp.descriptions || {};
      csv += `\r\n${comp.name},${d.Brave || ""},${d.Owners || ""},${d.Inclusive || ""}`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${department}-${jobTitle}-${jobLevel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{department} – {jobTitle} – {jobLevel}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" />
          ) : error ? (
            <Text color="red.500" textAlign="center">{error}</Text>
          ) : (
            <VStack spacing="6" align="stretch">
              {/* Actions */}
              <HStack justify="center" spacing="4">
                <Button onClick={handleExportToCSV}>Export to CSV</Button>
                {isEditing ? (
                  <Button colorScheme="green" onClick={handleSave}>Save</Button>
                ) : (
                  <Button colorScheme="purple" onClick={handleEditClick}>Edit</Button>
                )}
              </HStack>

              {/* Salary */}
              <Box p={4} bg="gray.50" borderRadius="md" shadow="sm">
                <Heading size="md" mb="2">Salary Banding</Heading>
                {isEditing ? (
                  <HStack spacing="4">
                    <Input
                      placeholder="Min Salary"
                      value={editedSalaryMin}
                      onChange={e => setEditedSalaryMin(e.target.value)}
                    />
                    <Input
                      placeholder="Max Salary"
                      value={editedSalaryMax}
                      onChange={e => setEditedSalaryMax(e.target.value)}
                    />
                  </HStack>
                ) : (
                  <Text>
                    <strong>Min:</strong> {jobDetails.salary_min} &nbsp;|&nbsp;
                    <strong>Max:</strong> {jobDetails.salary_max}
                  </Text>
                )}
              </Box>

              {/* Competencies Breakdown */}
              <VStack spacing="4" align="stretch">
                <Heading size="md">Competencies</Heading>
                {editedCompetencies.length ? (
                  editedCompetencies.map((comp, idx) => {
                    const d = comp.descriptions || {};
                    return (
                      <Box
                        key={idx}
                        p={4}
                        bg="gray.50"
                        borderRadius="md"
                        shadow="sm"
                      >
                        <Heading size="sm" mb="2">{comp.name}</Heading>

                        {/* If editing, show inputs instead */}
                        {isEditing ? (
                          <VStack spacing="2" align="stretch">
                            {["Brave", "Owners", "Inclusive"].map(label => (
                              <HStack key={label}>
                                <Text w="100px">{label}</Text>
                                <Input
                                  value={d[label] || ""}
                                  onChange={e => {
                                    const copy = [...editedCompetencies];
                                    copy[idx].descriptions[label] = e.target.value;
                                    setEditedCompetencies(copy);
                                  }}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Dimension</Th>
                                <Th>Description</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {["Brave", "Owners", "Inclusive"].map(label => (
                                <Tr key={label}>
                                  <Td fontWeight="bold">{label}</Td>
                                  <Td>{d[label]}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Text color="gray.500">No competencies available.</Text>
                )}
              </VStack>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobTitleDetailsModal;
