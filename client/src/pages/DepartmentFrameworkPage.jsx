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
  Icon
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const STATIC_CATEGORIES = [
  "Technical Skills",
  "Leadership & Management",
  "Soft Skills",
  "Process & Delivery",
  "Domain-Specific Knowledge",
  "Innovation & Problem-Solving",
  "Customer & Business Acumen"
];

const DepartmentFrameworkPage = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [competenciesByCategory, setCompetenciesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  /** ✅ Fetch Departments and Store IDs & Names */
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/get-departments"
      );
      if (!response.ok) throw new Error("Failed to fetch departments.");

      const data = await response.json();
      console.log("Fetched Departments:", data); // ✅ Debugging Log

      if (data.departments && Array.isArray(data.departments)) {
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setSelectedDepartmentId(data.departments[0].id); // ✅ Default to first department
          fetchCompetencies(data.departments[0].id); // ✅ Fetch competencies for default
        }
      } else {
        console.error("Invalid department data format:", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    }
  };

  /** ✅ Fetch Competencies using Department ID */
  const fetchCompetencies = async (departmentId) => {
    setLoading(true);
    setError(null);
    setCompetenciesByCategory({});

    try {
      console.log("Fetching competencies for Department ID:", departmentId); // ✅ Debugging

      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-categorized-framework/${departmentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch competencies.");

      const data = await response.json();
      console.log("Fetched categorized competencies:", data); // ✅ Debugging

      // ✅ Ensure competencies are stored properly (handle empty responses)
      setCompetenciesByCategory(data.competencies_by_category || {});
    } catch (err) {
      console.error("Error fetching competencies:", err);
      setError("Failed to fetch competencies.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Toggle Categories */
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (

<Box maxW="1200px" mx="auto" py="6">
  <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
    Competency Framework
  </Heading>

      {/* ✅ Department Dropdown (Stores ID, Displays Name) */}
      <Select
        placeholder="Select a department"
        onChange={(e) => {
          const selectedId = e.target.value;
          setSelectedDepartmentId(selectedId);
          fetchCompetencies(selectedId);
        }}
        value={selectedDepartmentId || ""}
        mb="4"
      >
        {departments.length > 0 ? (
          departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
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

      {/* ✅ Competency List with Categories */}
      {!loading && !error && competenciesByCategory && Object.keys(competenciesByCategory).length > 0 ? (
        Object.entries(competenciesByCategory).map(([category, competencies]) => {
          // ✅ Normalize category names (Fixing "Uncategorized" issue)
          const normalizedCategory = category.replace(/['"]+/g, "");

          // ✅ Ensure competencies is an array and not empty
          if (!Array.isArray(competencies) || competencies.length === 0) return null;

          return (
            <Box key={normalizedCategory} mt="6" border="1px solid #ccc" p="4" borderRadius="md">
              <Heading
                size="md"
                onClick={() => toggleCategory(normalizedCategory)}
                cursor="pointer"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {normalizedCategory}
                <Icon as={expandedCategories[normalizedCategory] ? FaChevronUp : FaChevronDown} />
              </Heading>
              <Collapse in={expandedCategories[normalizedCategory]}>
                <Table variant="simple" mt="2">
                  <Thead>
                    <Tr>
                      <Th>Competency</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {competencies.map((comp, index) => (
                      <Tr key={index}>
                        <Td>{comp.name || "Unnamed Competency"}</Td>
                        <Td>
                          {comp.descriptions && typeof comp.descriptions === "object"
                            ? Object.values(comp.descriptions).join(" | ") // Flatten descriptions into readable string
                            : "No description available"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Collapse>
            </Box>
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
