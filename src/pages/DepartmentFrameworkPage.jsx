import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Collapse,
  Icon,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DepartmentFrameworkPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [competenciesByLevel, setCompetenciesByLevel] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  /** ✅ Fetch Departments */
  const fetchDepartments = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/get-departments");
      if (!response.ok) throw new Error("Failed to fetch departments.");

      const data = await response.json();
      console.log("Fetched Departments:", data);

      if (data.departments && Array.isArray(data.departments)) {
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setSelectedDepartment(data.departments[0].department); // ✅ Default to first department
          fetchCompetenciesByLevel(data.departments[0].department); // ✅ Fetch competencies by level
        }
      } else {
        console.error("Invalid department data format:", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    }
  };

  /** ✅ Fetch Competencies Grouped by Level */
  const fetchCompetenciesByLevel = async (department) => {
    setLoading(true);
    setError(null);
    setCompetenciesByLevel({});

    try {
      console.log("Fetching competencies by level for Department:", department);

      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-framework-by-level/${department}`
      );
      if (!response.ok) throw new Error("Failed to fetch competencies.");

      const data = await response.json();
      console.log("Fetched competencies by level:", data);

      setCompetenciesByLevel(data.competencies_by_level || {});
    } catch (err) {
      console.error("Error fetching competencies:", err);
      setError("Failed to fetch competencies.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Toggle Levels */
  const toggleLevel = (level) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Competency Framework by Level
      </Heading>

      {/* ✅ Department Dropdown */}
      <Select
        placeholder="Select a department"
        onChange={(e) => {
          const selectedDept = e.target.value;
          setSelectedDepartment(selectedDept);
          fetchCompetenciesByLevel(selectedDept);
        }}
        value={selectedDepartment || ""}
        mb="4"
      >
        {departments.length > 0 ? (
          departments.map((dept) => (
            <option key={dept.id} value={dept.department}>
              {dept.department}
            </option>
          ))
        ) : (
          <option disabled>No departments found</option>
        )}
      </Select>

      {loading && <Spinner size="xl" color="purple.500" />}

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* ✅ Competency List Grouped by Level */}
      {!loading && !error && competenciesByLevel && Object.keys(competenciesByLevel).length > 0 ? (
        Object.entries(competenciesByLevel).map(([level, competencies]) => {
          if (!Array.isArray(competencies) || competencies.length === 0) return null;

          return (
            <Card key={level} mt="6" border="1px solid #ccc" borderRadius="lg" overflow="hidden">
              <CardBody>
                <Heading
                  size="md"
                  onClick={() => toggleLevel(level)}
                  cursor="pointer"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bg="purple.100"
                  p="3"
                  borderRadius="md"
                >
                  {level}
                  <Icon as={expandedLevels[level] ? FaChevronUp : FaChevronDown} />
                </Heading>
                <Collapse in={expandedLevels[level]}>
                  <Table variant="striped" mt="2">
                    <Thead>
                      <Tr bg="gray.100">
                        <Th>Competency</Th>
                        <Th>Description</Th>
                        <Th>Job Title</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {competencies.map((comp, index) => (
                        <Tr key={index}>
                          <Td fontWeight="bold">{comp.name || "Unnamed Competency"}</Td>
                          <Td>{comp.description || "No description available"}</Td>
                          <Td>{comp.job_title || "N/A"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Collapse>
              </CardBody>
            </Card>
          );
        })
      ) : (
        !loading && !error && (
          <Alert status="warning" mt="4">
            <AlertIcon />
            No competencies available
          </Alert>
        )
      )}
    </Box>
  );
};

export default DepartmentFrameworkPage;
