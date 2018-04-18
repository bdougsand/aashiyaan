#!/bin/bash

set -e

if ! which aws; then
    echo "Please install the AWS command line tools before running this script."
    exit 1
fi

if ! which jq; then
    echo "Please install the 'jq' utility before running this script."
    exit 1
fi

if [ -n "$1" ]; then
    bucket_name="$1"
else
    echo "What's the name of the bucket?"
    read bucket_name
fi

if [ -n "$2" ]; then
    bucket_writer=${2}
else
    echo "What's tha name of the bucket writer?"
    read bucket_writer
fi

echo "Create a new access key for $bucket_writer?"
read yn
if [[ "$yn" =~ ^y ]]; then
    ak_response=$(aws iam create-access-key --user-name "$bucket_writer")
    key_id=$(echo "$ak_response" | jq '.AccessKey.AccessKeyId')
    skey=$(echo "$ak_response" | jq '.AccessKey.SecretAccessKey')
    echo "Access Key ID: $key_id"
    echo "Secret Access Key: $skey"
fi

aws s3 mb s3://$bucket_name || echo "$bucket_name already exists... continuing"

pol_response=$(aws iam create-policy --policy-name video-dropbox\
    --description "Grants write permissions to ${bucket_name}'s uploads directory"\
    --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::'$bucket_name'/uploads/*"
            ]
        }
    ]
}')
policy_arn=$(echo $pol_response | jq -r '.Policy.Arn')
echo "Policy ARN: $policy_arn"

aws iam attach-user-policy --user-name "$bucket_writer" --policy-arn "$policy_arn"
echo "Policy attached."
