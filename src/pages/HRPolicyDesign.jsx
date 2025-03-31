import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Box,
  Heading,
  Button,
  Spinner,
  Card,
  CardBody,
  Select,
  Textarea,
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";

const HRPolicyDesign = () => {
  const toast = useToast();

  // Form state variables
  const [business, setBusiness] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [reviewCycle, setReviewCycle] = useState("");
  const [legalConsiderations, setLegalConsiderations] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedPolicy, setGeneratedPolicy] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  // Helper to add a version to the local history
  const addVersion = (policyText) => {
    const timestamp = new Date().toISOString();
    setVersionHistory((prev) => [...prev, { timestamp, policyText }]);
  };

  // Helper to persist the version to the backend
  const saveVersionToBackend = async (policyDraft) => {
    const payload = {
      business,
      policy_type: policyType,
      target_audience: targetAudience,
      effective_date: effectiveDate,
      review_cycle: reviewCycle,
      legal_considerations: legalConsiderations,
      additional_context: additionalContext,
      draft_content: policyDraft,
    };

    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/save-policy-version",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to save version to backend.");
      const data = await response.json();
      toast({
        title: "Version Saved",
        description: `Version ID: ${data.version_id}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error Saving Version",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Generate initial policy draft
  const handleGeneratePolicy = async () => {
    if (!business || !policyType) {
      toast({
        title: "Missing Information",
        description: "Please select a business and provide a policy type.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const requestBody = {
      business,
      policyType,
      targetAudience,
      effectiveDate,
      reviewCycle,
      legalConsiderations,
      additionalContext,
    };

    setLoading(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/generate-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok)
        throw new Error("Failed to generate policy document.");
      const data = await response.json();
      setGeneratedPolicy(data.policyDocument);
      addVersion(data.policyDocument); // Save locally
      await saveVersionToBackend(data.policyDocument); // Persist to backend
      toast({
        title: "Policy Generated",
        description: "The HR policy document has been successfully generated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error Generating Policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Refine the policy draft based on feedback
  const handleRefinePolicy = async () => {
    if (!generatedPolicy) {
      toast({
        title: "No Draft Available",
        description: "Please generate a policy draft first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const requestBody = {
      currentDraft: generatedPolicy,
      feedback,
    };

    setLoading(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/refine-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok)
        throw new Error("Failed to refine policy document.");
      const data = await response.json();
      setGeneratedPolicy(data.refinedPolicy);
      addVersion(data.refinedPolicy); // Save locally
      await saveVersionToBackend(data.refinedPolicy); // Persist to backend
      toast({
        title: "Policy Refined",
        description:
          "The HR policy document has been updated based on your feedback.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFeedback(""); // Clear feedback field after refining
    } catch (error) {
      toast({
        title: "Error Refining Policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Download the current policy as a text file
  const handleDownload = () => {
    const blob = new Blob([generatedPolicy], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HR_Policy.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
<Box maxW="900px" mx="auto" py="6">
  <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
    HR Policy Design
  </Heading>
</Box>

      {/* Business Selector */}
      <Select
        placeholder="Select a Sony Sports Business"
        value={business}
        onChange={(e) => setBusiness(e.target.value)}
        mb="4"
      >
        <option value="Hawk-Eye">Hawk-Eye</option>
        <option value="Pulselive">Pulselive</option>
        <option value="Beyond Sports">Beyond Sports</option>
        <option value="Sony Sports">Sony Sports</option>
      </Select>

      {/* Policy Type Input */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
        <CardBody>
          <Heading size="md" mb="2">
            Policy Type
          </Heading>
          <Textarea
            placeholder="e.g., Code of Conduct, Anti-harassment, Diversity & Inclusion"
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Additional Details */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb="2">
                Target Audience
              </Heading>
              <Textarea
                placeholder="e.g., All Employees, Management, Specific Departments"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Effective Date
              </Heading>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                }}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Review Cycle
              </Heading>
              <Textarea
                placeholder="e.g., annually, bi-annually"
                value={reviewCycle}
                onChange={(e) => setReviewCycle(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Legal & Compliance Considerations
              </Heading>
              <Textarea
                placeholder="Include any relevant legal or regulatory frameworks"
                value={legalConsiderations}
                onChange={(e) => setLegalConsiderations(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Additional Context
              </Heading>
              <Textarea
                placeholder="Provide any additional context or specifics for the policy"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Generate Policy Button */}
      <Button
        colorScheme="blue"
        onClick={handleGeneratePolicy}
        isLoading={loading}
        mb="4"
      >
        Generate Policy Document 🤖
      </Button>

      {/* Display Generated Policy with Editor/Preview */}
      {generatedPolicy && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
          <CardBody>
            <Heading size="md" mb="4">
              Generated HR Policy Document
            </Heading>
            {isPreview ? (
              <Box border="1px solid #E2E8F0" p="4" borderRadius="md" minH="200px">
                <Text whiteSpace="pre-wrap">{generatedPolicy}</Text>
              </Box>
            ) : (
              <ReactQuill theme="snow" value={generatedPolicy} onChange={setGeneratedPolicy} />
            )}
            <Box mt="4">
              <Heading size="sm" mb="2">
                Feedback / Refinement Comments
              </Heading>
              <Textarea
                placeholder="Enter any feedback or changes you'd like to see in the policy..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button
                colorScheme="purple"
                mt="2"
                onClick={handleRefinePolicy}
                isLoading={loading}
              >
                Resubmit for Refinement
              </Button>
            </Box>
            <Box mt="4" display="flex" justifyContent="space-between">
              <Button colorScheme="teal" onClick={() => setIsPreview(!isPreview)}>
                {isPreview ? "Edit Mode" : "Preview Mode"}
              </Button>
              <Button colorScheme="green" onClick={handleDownload}>
                Download Policy
              </Button>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Version History */}
      {versionHistory.length > 0 && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4">
          <CardBody>
            <Heading size="md" mb="4">Version History</Heading>
            <VStack align="stretch">
              {versionHistory.map((version, index) => (
                <Box
                  key={index}
                  p="2"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                >
                  <Text fontSize="sm" color="gray.600">
                    Version from {new Date(version.timestamp).toLocaleString()}
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {version.policyText}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {loading && (
        <Box textAlign="center" mt="4">
          <Spinner size="xl" />
        </Box>
      )}
    </Box>
  );
};

export default HRPolicyDesign;
