import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  Permissions,
  RequirePermissions,
} from "../auth/decorators/permissions.decorator";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { JoinInvitationDto } from "./dto/join-invitation.dto";
import { Invitation } from "./invitation.entity";
import { InvitationsService } from "./invitations.service";

@ApiTags("Invitations")
@Controller("invitations")
@UseGuards(JwtAuthGuard, AuthorizationGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: "Create an invite link for a split" })
  @ApiResponse({ status: 201, description: "Invite link created" })
  @ApiResponse({ status: 404, description: "Split not found" })
  @RequirePermissions(Permissions.CAN_CREATE_INVITATION)
  async create(@Body(ValidationPipe) dto: CreateInvitationDto) {
    return this.invitationsService.create(dto);
  }

  @Get(":token")
  @ApiOperation({
    summary: "Get invite details by token (validates expiry and use)",
  })
  @ApiParam({ name: "token", description: "Invite token (UUID)" })
  @ApiResponse({ status: 200, description: "Invite details", type: Invitation })
  @ApiResponse({
    status: 410,
    description: "Invite expired or already used (Gone)",
  })
  @RequirePermissions(Permissions.CAN_READ_INVITATION)
  async getByToken(@Param("token") token: string): Promise<Invitation> {
    return this.invitationsService.getByToken(token);
  }

  @Post("join/:token")
  @ApiOperation({ summary: "Join a split via invite token" })
  @ApiParam({ name: "token", description: "Invite token (UUID)" })
  @ApiResponse({
    status: 201,
    description: "Joined split; participant created",
  })
  @ApiResponse({
    status: 410,
    description: "Invite expired or already used (Gone)",
  })
  @RequirePermissions(Permissions.CAN_ACCEPT_INVITATION)
  async join(
    @Param("token") token: string,
    @Body(ValidationPipe) dto: JoinInvitationDto,
  ) {
    return this.invitationsService.joinByToken(token, dto);
  }
}
